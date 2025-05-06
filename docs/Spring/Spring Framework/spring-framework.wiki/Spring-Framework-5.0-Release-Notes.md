_Note that Spring Framework 4.3.x and therefore Spring Framework 4 overall reached its EOL cut-off on December 31st, 2020. The Spring Framework 5.x generation will reach its end of OSS support on August 31st, 2024. Please upgrade to [a supported generation or consider a commercial subscription](https://spring.io/projects/spring-framework#support)!_

_See also the [[Spring-Framework-5-FAQ]]._

## Upgrading From Spring Framework 4.x

### Baseline update

Spring Framework 5.0 requires JDK 8 (Java SE 8), since its entire codebase is based on Java 8 source code level and provides full compatibility with JDK 9 on the classpath as well as the module path (Jigsaw). Java SE 8 update 60 is suggested as the minimum patch release for Java 8, but it is generally recommended to use a recent patch release.

The Java EE 7 API level is required in Spring's corresponding modules now, with runtime support for the EE 8 level:

* Servlet 3.1 / 4.0
* JPA 2.1 / 2.2
* Bean Validation 1.1 / 2.0
* JMS 2.0
* JSON Binding API 1.0 (as an alternative to Jackson / Gson)

### Web Servers

* Tomcat 8.5+
* Jetty 9.4+
* WildFly 10+
* WebSphere 9+
* with the addition of Netty 4.1 and Undertow 1.4 for Spring WebFlux

### Libraries

* Jackson 2.9+
* EhCache 2.10+
* Hibernate 5.0+
* OkHttp 3.0+
* XmlUnit 2.0+
* XStream 1.4.7+

### Removed Packages, Classes and Methods

* Package beans.factory.access (BeanFactoryLocator mechanism).
  * Including `SpringBeanAutowiringInterceptor` for EJB3 which was based on such a statically shared context. Preferably integrate a Spring backend via CDI instead.
* Package jdbc.support.nativejdbc (NativeJdbcExtractor mechanism).
  * Superseded by the native `Connection.unwrap` mechanism in JDBC 4. There is generally very little need for unwrapping these days, even against the Oracle JDBC driver.
* Package `mock.staticmock` removed from `spring-aspects` module.
  * No support for `AnnotationDrivenStaticEntityMockingControl` anymore.
* Packages `web.view.tiles2` and `orm.hibernate3/hibernate4` dropped.
  * Minimum requirement: Tiles 3 and Hibernate 5 now.
* Many deprecated classes and methods removed across the codebase.
  * A few compromises made for commonly used methods in the ecosystem.
* Note that several deprecated methods have been removed from the JSP tag library as well.
  * e.g. FormTag's "commandName" attribute, superseded by "modelAttribute" years ago.

### Dropped support

The Spring Framework no longer supports: Portlet, Velocity, JasperReports, XMLBeans, JDO, Guava (replaced by the Caffeine support). If those are critical to your project, you should stay on Spring Framework 4.3.x (supported until 2020).
Alternatively, you may create custom adapter classes in your own project (possibly derived from Spring Framework 4.x).

### Commons Logging setup

Spring Framework 5.0 comes with its own Commons Logging bridge in the form of the 'spring-jcl' module that 'spring-core' depends on. This replaces the former dependency on the 'commons-logging' artifact which required an exclude declaration for switching to 'jcl-over-slf4j' (SLF4J / Logback) and an extra bridge declaration for 'log4j-jcl' (Log4j 2.x).

Now, 'spring-jcl' itself is a very capable Commons Logging bridge with first-class support for Log4j 2, SLF4J and JUL (java.util.logging), working out of the box without any special excludes or bridge declarations for all three scenarios.

You may still exclude 'spring-jcl' from 'spring-core' and bring in 'jcl-over-slf4j' as your choice, in particular for upgrading an existing project. However, please note that 'spring-jcl' can easily supersede 'jcl-over-slf4j' by default for a streamlined Maven dependency setup, reacting to the plain presence of the Log4j 2.x / Logback core jars at runtime. 

Please note: For a clean classpath arrangement (without several variants of Commons Logging on the classpath), you might have to declare explicit excludes for 'commons-logging' and/or 'jcl-over-slf4j' in other libraries that you're using.

### CORS support

CORS support has been updated to be more secured by default and more flexible.

When upgrading, be aware that [`allowCredentials` default value has been changed to `false`](https://jira.spring.io/browse/SPR-16130) and now requires to be explicitly set to `true` if cookies or authentication are needed in CORS requests. This can be done at controller level via `@CrossOrigin(allowCredentials="true")` or configured globally via `WebMvcConfigurer#addCorsMappings`.

CORS configuration combination logic has also been [slightly modified](https://jira.spring.io/browse/SPR-15772) to differentiate user defined `*` values where additive logic should be used and default `@CrossOrigin` values which should be replaced by any user provided values.


## New and Noteworthy

### JDK 8+ and Java EE 7+ Baseline

* Entire framework codebase based on Java 8 source code level now.
  * Improved readability through inferred generics, lambdas, etc.
  * Conditional support for Java 8 features now in straight code.
* Full compatibility with JDK 9 for development and deployment.
  * On classpath as well as module path (with stable automatic module names).
  * Framework build and test suite passes on JDK 9 (runs on JDK 8 by default).
* Java EE 7 API level required in Spring's corresponding features now.
  * Servlet 3.1, Bean Validation 1.1, JPA 2.1, JMS 2.0
  * Recent servers: e.g. Tomcat 8.5+, Jetty 9.4+, WildFly 10+
* Compatibility with Java EE 8 API level at runtime.
  * Servlet 4.0, Bean Validation 2.0, JPA 2.2, JSON Binding API 1.0
  * Tested against Tomcat 9.0, Hibernate Validator 6.0, Apache Johnzon 1.1

### Removed Packages, Classes and Methods

* Package `beans.factory.access` (`BeanFactoryLocator` mechanism).
* Package `jdbc.support.nativejdbc` (`NativeJdbcExtractor` mechanism).
* Package `mock.staticmock` removed from `spring-aspects` module.
  * No support for `AnnotationDrivenStaticEntityMockingControl` anymore.
* Packages `web.view.tiles2` and `orm.hibernate3/hibernate4` dropped.
  * Minimum requirement: Tiles 3 and Hibernate 5 now.
* Dropped support: Portlet, Velocity, JasperReports, XMLBeans, JDO, Guava.
  * Recommendation: Stay on Spring Framework 4.3.x for those if needed.
* Many deprecated classes and methods removed across the codebase.
  * A few compromises made for commonly used methods in the ecosystem.

### General Core Revision

* JDK 8+ enhancements:
  * Efficient method parameter access based on Java 8 reflection enhancements.
  * Selective declarations of Java 8 default methods in core Spring interfaces.
  * Consistent use of JDK 7 `Charset` and `StandardCharsets` enhancements.
* JDK 9 compatibility:
  * Avoiding JDK APIs which are deprecated in JDK 9 wherever possible.
  * Consistent instantiation via constructors (with revised exception handling).
  * Defensive use of reflection against core JDK classes.
* Non-null API declaration at the package level:
  * Nullable arguments, fields and return values explicitly annotated with `@Nullable`.
  * Primarily for use with IntelliJ IDEA and Kotlin, but also Eclipse and FindBugs.
  * Some Spring APIs are not tolerating null values anymore (e.g. in `StringUtils`).
* `Resource` abstraction provides `isFile` indicator for defensive `getFile` access.
  * Also features NIO-based `readableChannel` accessor in the `Resource` interface.
  * File system access via NIO.2 streams (no `FileInput/OutputStream` used anymore).
* Spring Framework 5.0 comes with its own Commons Logging bridge out of the box:
  * `spring-jcl` instead of standard Commons Logging; still excludable/overridable.
  * Autodetecting Log4j 2.x, SLF4J, JUL (java.util.logging) without any extra bridges.
* `spring-core` comes with ASM 6.0 (next to CGLIB 3.2.5 and Objenesis 2.6).

### Core Container

* Support for any `@Nullable` annotations as indicators for optional injection points.
* Functional style on `GenericApplicationContext`/`AnnotationConfigApplicationContext`
  * `Supplier`-based bean registration API with bean definition customizer callbacks.
* Consistent detection of transaction, caching, async annotations on interface methods.
  * In case of CGLIB proxies.
* XML configuration namespaces streamlined towards unversioned schemas.
  * Always resolved against latest `xsd` files; no support for deprecated features.
  * Version-specific declarations still supported but validated against latest schema.
* Support for candidate component index (as alternative to classpath scanning).

### Spring Web MVC

* Full Servlet 3.1 signature support in Spring-provided `Filter` implementations.
* Support for Servlet 4.0 `PushBuilder` argument in Spring MVC controller methods.
* `MaxUploadSizeExceededException` for Servlet 3.0 multipart parsing on common servers.
* Unified support for common media types through `MediaTypeFactory` delegate.
  * Superseding use of the Java Activation Framework.
* Data binding with immutable objects (Kotlin / Lombok / `@ConstructorProperties`)
* Support for the JSON Binding API (with Eclipse Yasson or Apache Johnzon as an alternative to Jackson and GSON).
* Support for Jackson 2.9.
* Support for Protobuf 3.
* Support for Reactor 3.1 `Flux` and `Mono` as well as RxJava 1.3 and 2.1 as return values from Spring MVC controller methods targeting use of the new reactive `WebClient` (see below) or Spring Data Reactive repositories in Spring MVC controllers.
* New `ParsingPathMatcher` alternative to `AntPathMatcher` with more efficient parsing and [extended syntax](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/web/util/pattern/PathPattern.html).
* `@ExceptionHandler` methods allow `RedirectAttributes` arguments (and therefore flash attributes).
* Support for `ResponseStatusException` as a programmatic alternative to `@ResponseStatus`.
* Support script engines that do not implement `Invocable` via direct rendering of the script provided using `ScriptEngine#eval(String, Bindings)`, and also i18n and nested templates in `ScriptTemplateView` via the new `RenderingContext` parameter.
* Spring's FreeMarker macros (`spring.ftl`) use HTML output formatting now (requiring FreeMarker 2.3.24+).

### Spring WebFlux

* New [spring-webflux](https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html#spring-webflux) module, an alternative to `spring-webmvc` built on a [reactive](https://github.com/reactive-streams/reactive-streams-jvm) foundation -- fully asynchronous and non-blocking, intended for use in an event-loop execution model vs traditional large thread pool with thread-per-request execution model.
* Reactive infrastructure in `spring-core` such as `Encoder` and `Decoder` for encoding and decoding streams of Objects; `DataBuffer` abstraction, e.g. for using Java `ByteBuffer` or Netty `ByteBuf`; `ReactiveAdapterRegistry` for transparent support of reactive libraries in controller method signatures.
* Reactive infrastructure in `spring-web` including `HttpMessageReader` and `HttpMessageWriter` that build on and delegate to `Encoder` and `Decoder`; server `HttpHandler` with adapters to (non-blocking) runtimes such as Servlet 3.1+ containers, Netty, and Undertow; `WebFilter`, `WebHandler` and other non-blocking contract alternatives to Servlet API equivalents.
* `@Controller` style, annotation-based, programming model, similar to Spring MVC, but supported in WebFlux, running on a reactive stack, e.g. capable of supporting reactive types as controller method arguments, never blocking on I/O, respecting backpressure all the way to the HTTP socket, and running on extra, non-Servlet containers such as Netty and Undertow.
* New [functional programming model](https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html#webflux-fn) ("WebFlux.fn") as an alternative to the `@Controller`, annotation-based, programming model -- minimal and transparent with an endpoint routing API, running on the same reactive stack and WebFlux infrastructure.
* New `WebClient` with a functional and reactive API for HTTP calls, comparable to the `RestTemplate` but through a fluent API and also excelling in non-blocking and streaming scenarios based on WebFlux infrastructure; in 5.0 the `AsyncRestTemplate` is deprecated in favor of the `WebClient`.

### [Kotlin support](https://docs.spring.io/spring/docs/current/spring-framework-reference/kotlin.html#kotlin)
* Null-safe API when using Kotlin 1.1.50 or higher.
* Support for Kotlin immutable classes with optional parameters and default values.
* Functional bean definition Kotlin DSL.
* Functional routing Kotlin DSL for WebFlux.
* Leveraging Kotlin reified type parameters to avoid specifying explicitly the `Class` to use for serialization/deserialization in various APIs like `RestTemplate` or WebFlux APIs.
* Kotlin null-safety support for `@Autowired`/`@Inject` and `@RequestParam`/`@RequestHeader`/etc annotations in order to determine if an injection point or handler method parameter is required or not.
* Kotlin script support in `ScriptTemplateView` for both Spring MVC and Spring WebFlux.
* Array-like setters added to `Model`, `ModelMap` and `Environment`.
* Support for Kotlin autowired constructor with optional parameters.
* Kotlin reflection is used to determine interface method parameters.

### Testing Improvements

* Complete support for [JUnit 5](https://junit.org/junit5/)'s _Jupiter_ programming and extension models in the Spring TestContext Framework.
  * [`SpringExtension`](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#testcontext-junit-jupiter-extension): an implementation of multiple extension APIs from JUnit Jupiter that provides full support for the existing feature set of the Spring TestContext Framework. This support is enabled via `@ExtendWith(SpringExtension.class)`.
  * [`@SpringJUnitConfig`](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#integration-testing-annotations-junit-jupiter-springjunitconfig): a composed annotation that combines `@ExtendWith(SpringExtension.class)` from JUnit Jupiter with `@ContextConfiguration` from the Spring TestContext Framework.
  * [`@SpringJUnitWebConfig`](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#integration-testing-annotations-junit-jupiter-springjunitwebconfig): a composed annotation that combines `@ExtendWith(SpringExtension.class)` from JUnit Jupiter with `@ContextConfiguration` and `@WebAppConfiguration` from the Spring TestContext Framework.
  * [`@EnabledIf`](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#integration-testing-annotations-junit-jupiter-enabledif): signals that the annotated test class or test method is _enabled_ if the supplied SpEL expression or property placeholder evaluates to `true`.
  * [`@DisabledIf`](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#integration-testing-annotations-junit-jupiter-disabledif): signals that the annotated test class or test method is _disabled_ if the supplied SpEL expression or property placeholder evaluates to `true`.
* Support for [parallel test execution](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#testcontext-parallel-test-execution) in the Spring TestContext Framework.
* New _before_ and _after_ test execution callbacks in the Spring TestContext Framework with support for TestNG, JUnit 5, and JUnit 4 via the `SpringRunner` (but not via JUnit 4 rules).
  * New `beforeTestExecution()` and `afterTestExecution()` callbacks in the `TestExecutionListener` API and `TestContextManager`.
* `MockHttpServletRequest` now has `getContentAsByteArray()` and `getContentAsString()` methods for accessing the content (i.e., request body).
* The `print()` and `log()` methods in Spring MVC Test now print the request body if the character encoding has been set in the mock request.
* The `redirectedUrl()` and `forwardedUrl()` methods in Spring MVC Test now support URI templates with variable expansion.
* XMLUnit support upgraded to 2.3.
