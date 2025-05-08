_This is a preview of the Spring Framework 7.0 release, scheduled for November 2025._

## Upgrading From Spring Framework 6.2

### Baseline upgrades

Spring Framework 7.0 does not change the JDK baseline, expecting a JDK 17-27 compatibility range.
This new generation raises its minimum requirements with the following libraries:

* Jakarta EE 11 (Tomcat 11+)
* Kotlin 2.x, see [#33629](https://github.com/spring-projects/spring-framework/issues/33629)
* JSONassert 2.0, see [#33799](https://github.com/spring-projects/spring-framework/issues/33799)
* GraalVM 23 with the [new "exact reachability metadata" format](https://www.graalvm.org/jdk23/reference-manual/native-image/metadata/#reachability-metadata).

### Removed APIs

#### Spring JCL has been retired

The `spring-jcl` module has been removed in favor of [Apache Commons Logging](https://github.com/apache/commons-logging) 1.3.0. This change should be transparent for most applications, as `spring-jcl` was a transitive dependency and the logging API calls should not change. See [#32459](https://github.com/spring-projects/spring-framework/issues/32459) for more details.

#### Path mapping options

Several path mapping options have been marked for removal since 6.0. They are now removed completely.
This includes:
* `suffixPatternMatch`/`registeredSuffixPatternMatch` for annotated controller methods
* `trailingSlashMatch` for extensions of `AbstractHandlerMapping`
* `favorPathExtension`/`ignoreUnknownPathExtensions` and underlying `PathExtensionContentNegotiationStrategy` and `ServletPathExtensionContentNegotiationStrategy` for content negotiation, configurable through `ContentNegotiationManagerFactoryBean` and in the MVC Java config
* `matchOptionalTrailingSeparator` in `PathPatternParser`

#### Other removals

Many other APIs and features were removed as part of [#33809](https://github.com/spring-projects/spring-framework/issues/33809), including:
* `ListenableFuture` in favor of `CompletableFuture`
* OkHttp3 support
* WebJars support with `org.webjars:webjars-locator-core` in favor of `org.webjars:webjars-locator-lite`


### Deprecations

* the `<mvc:*` XML configuration namespace for Spring MVC is now deprecated in favor of the Java configuration variant. There are no plans yet for removing it completely but XML configuration will not be updated to follow the Java configuration model. Other namespaces (like `<bean>`) are NOT deprecated.
* The Kotlin team has shared there intention to remove the JSR 223 support in a future Kotlin 2.x release. As a result, Kotlin scripts template support in Spring has been deprecated. 

### Null Safety

Spring nullness annotations with JSR 305 semantics are deprecated in favor of [JSpecify annotations](https://jspecify.dev/docs/user-guide/). The Spring Framework codebase has been migrated to Specify and now specifies the nullness of array/vararg elements and generic types. You can find more details on how to migrate in [this dedicated section of the reference documentation](https://docs.spring.io/spring-framework/reference/7.0-SNAPSHOT/core/null-safety.html#null-safety-migrating).

### GraalVM Native applications

Spring Framework 7.0 switches to the unified reachability metadata format, being adopted by the GraalVM community.
Applications contributing `RuntimeHints` should apply the following changes:

The resource hints syntax has changed from a `java.util.regex.Pattern` format to a ["glob pattern" format](https://www.graalvm.org/jdk23/reference-manual/native-image/metadata/#resource-metadata-in-json). In practice, applications might need to change their resource hints registrations if they were using wildcards. Previously, `"/files/*.ext"` matched both `"/files/a.ext"` and `"/files/folder/b.txt"`. The new behavior matches only the former. To match both, you will need to use `"/files/**/*.ext"` instead.
Registration of "excludes" has been removed completely.

Registering a reflection hint for a type now implies methods, constructors and fields introspection.
As a result, `ExecutableMode.INTROSPECT`, and all `MemberCategory` values except `MemberCategory.INVOKE_*` are being deprecated.
They have no replacement, as registering a type hint is enough.

In practice, it is enough to replace this:

```
hints.reflection().registerType(MyType.class, MemberCategory.DECLARED_FIELDS);
```

By this:
```
hints.reflection().registerType(MyType.class);
```

As for `MemberCategory.PUBLIC_FIELDS` and `MemberCategory.DECLARED_FIELDS`, values were replaced by `INVOKE_PUBLIC_FIELDS` and `INVOKE_DECLARED_FIELDS` to make their original intent clearer and align with the rest of the API. Note, if you were using those values for
reflection only, you can safely remove those hints in favor of a simple type hint.

More details on the related changes in [#33847](https://github.com/spring-projects/spring-framework/issues/33847).

### kotlinx.serialization JSON support

The `org.jetbrains.kotlinx:kotlinx-serialization-json` dependency is quite popular in the Kotlin ecosystem and is often transitive dependency.
This caused issues where applications were using this library for reading/writing JSON instead of Jackson; there is no easy workaround.
As of this version, the Kotlinx Serialization JSON codecs and converters will not be auto-detected and configured when the library is on the classpath. Support is still present in Framework, but developers will need to manually configure it. 

## New and Noteworthy

### Null Safety

The Spring Framework codebase is annotated with [JSpecify](https://jspecify.dev/docs/start-here/) annotations to declare the nullness of APIs, fields and related type usages. JSpecify provides significant enhancements compared to the previous JSR 305 based arrangement, such as properly defined specifications, a canonical dependency with no split-package issue, better tooling, better Kotlin integration and the capability to specify generic type, array and vararg elements nullness. Using JSpecify annotations is also recommended for Spring-based applications. For more on this, [check out the revisited "Null Safety" section of our reference documentation](https://docs.spring.io/spring-framework/reference/7.0-SNAPSHOT/core/null-safety.html).
