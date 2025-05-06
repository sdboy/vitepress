Support for compiling Spring applications to native executables via Ahead-Of-Time transformations and [GraalVM](https://www.graalvm.org/) native image compiler will be shipped as part of Spring Framework 6+ and is documented in this page. 

# Build-time initialization

In order to obtain an optimized image size and memory footprint, GraalVM native image compiler performs a static analysis of the code of applications from the provided entry points (main + reflection entries configured) in order to identify reachable code paths which are then compiled to native code.

## Avoid class build-time initialization
By default GraalVM, like the JVM, initializes class static fields and blocks at runtime, but also provides the capability to initialize classes at build-time in order to allow more code removal during the compilation and reduce the amount of reflection required at runtime.

This mechanism has a significant drawback : build-time class initialization is a viral behavior that can leads to unsolvable incompatibilities. All fields and all classes transitively used at build-time are initialized at build-time as well, which can be an issue for various use cases including thread pool creation, field controller by a runtime system property or a logger that will transitively use a library like Jackson.

That’s why in Spring Framework 6+ and related Spring portfolio projects, the goal is to reduce as much as possible build-time class initialization which should be limited to classes that do not compile yet to native image (often due to GraalVM bugs like [this one](https://github.com/oracle/graal/issues/4673)). If and only if there is no other way, it is possible to add a `META-INF/native-image/<groupId>/<artifactIdId>/native-image.properties` resource file to specify classes to initialize at build-time. Examples of such classes in Spring Framework can be found listed in [spring-core](https://github.com/spring-projects/spring-framework/blob/main/spring-core/src/main/resources/META-INF/native-image/org.springframework/spring-core/native-image.properties) or [spring-web](https://github.com/spring-projects/spring-framework/blob/main/spring-web/src/main/resources/META-INF/native-image/org.springframework/spring-web/native-image.properties).

## Build-time fields initialization for classpath checks

For the frequent use case of classpath checks via static boolean fields like in [WebMvcConfigurationSupport](https://github.com/spring-projects/spring-framework/blob/f2d31b7a20c1e561bf63be1b019f63fc127f18c4/spring-webmvc/src/main/java/org/springframework/web/servlet/config/annotation/WebMvcConfigurationSupport.java#L201-L233) where there is a possibility to perform build-time code removal, 
Spring Framework provides [a GraalVM feature](https://github.com/spring-projects/spring-framework/tree/main/spring-core/graalvm) that initializes those boolean static fields at build-time without having to use build-time class initialization. The following patterns are used to detect those fields:
* `org.springframework.core.NativeDetector#imageCode`
* `org.springframework.*#*Present`
* `org.springframework.*#*PRESENT`
* `reactor.*#*Available`

When building a project based on Spring Framework 6+, the fields initialized at build-time are logged during the native image build, for example:
```
 1 user-provided feature(s)
  - org.springframework.aot.graalvm.ConstantFieldFeature
Field org.springframework.core.NativeDetector#imageCode set to true at build time
Field org.springframework.core.KotlinDetector#kotlinReflectPresent set to false at build time
Field org.springframework.core.KotlinDetector#kotlinPresent set to false at build time
Field org.springframework.web.context.support.StandardServletEnvironment#jndiPresent set to true at build time
Field org.springframework.format.support.DefaultFormattingConversionService#jsr354Present set to false at build time
Field org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport#romePresent set to false at build time
Field org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport#jaxb2Present set to false at build time
Field org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport#jackson2Present set to true at build time
Field org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport#jackson2XmlPresent set to false at build time
Field org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport#jackson2SmilePresent set to false at build time
Field org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport#jackson2CborPresent set to false at build time
Field org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport#gsonPresent set to false at build time
Field org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport#jsonbPresent set to false at build time
Field org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport#kotlinSerializationJsonPresent set to false at build time
...
```

As a result, code like `if (jackson2Present) { converters.add(new MappingJackson2HttpMessageConverter()); }` will be evaluated as `if (false) { converters.add(new MappingJackson2HttpMessageConverter()); }` at build-time allowing to remove `MappingJackson2HttpMessageConverter` from the native image.

While limited to a subset of use cases, this feature should be preferred as it is safe to use and do not imply the same compatibility side-effects than class build-time initialization.