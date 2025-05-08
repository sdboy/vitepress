_Note that Spring Framework 4.3.x and therefore Spring Framework 4 overall reached its EOL cut-off on December 31st, 2020. The Spring Framework 5.x generation will reach its end of OSS support on August 31st, 2024. Please upgrade to [a supported generation or consider a commercial subscription](https://spring.io/projects/spring-framework#support)!_

_See also the [[Spring-Framework-5-FAQ]]._

## Upgrading From Spring Framework 5.1

### Libraries

Spring Framework 5.2 now requires Jackson 2.9.7+ and explicitly supports the recently released Jackson 2.10 GA. See [gh-23522](https://github.com/spring-projects/spring-framework/issues/23522).

In Reactor Core 3.3, the Kotlin extensions are deprecated and replaced by a dedicated [reactor-kotlin-extensions](https://github.com/reactor/reactor-kotlin-extensions/) project/repo. You may have to add `io.projectreactor.kotlin:reactor-kotlin-extensions` dependency to your project and update related packages to use the non-deprecated variants.

### Core Container

Spring's annotation retrieval algorithms have been completely revised for efficiency and consistency, as well as for potential optimizations through annotation presence hints (e.g. from a compile-time index). This may have side effects -- for example, finding annotations in places where they haven't been found before or not finding annotations anymore where they have previously been found accidentally. While we don't expect common Spring applications to be affected, annotation declaration accidents in application code may get uncovered when you upgrade to 5.2. For example, all annotations must now be annotated with `@Retention(RetentionPolicy.RUNTIME)` in order for Spring to find them. See [gh-23901](https://github.com/spring-projects/spring-framework/issues/23901), [gh-22886](https://github.com/spring-projects/spring-framework/issues/22886), and [gh-22766](https://github.com/spring-projects/spring-framework/issues/22766).

### Web Applications

#### `@RequestMapping` without path attribute

`@RequestMapping()` and meta-annotated variants `@GetMapping()`, `PostMapping()`, etc., without explicitly declared `path` patterns are now equivalent to `RequestMapping("")` and match only to URLs with no path. In the absence of declared patterns previously the path was not checked thereby matching to any path. If you would like to match to all paths, please use `"/**"` as the pattern. [gh-22543](https://github.com/spring-projects/spring-framework/issues/22543)
 
#### `@EnableWebMvc` and `@EnableWebFlux` Infrastructure

`@Bean` methods in `Web**ConfigurationSupport` now declare bean dependencies as method arguments rather than use method calls to make it possible to avoid creating proxies for bean methods via `@Configuration(proxyBeanMethods=false)` which Spring Boot 2.2 now does. This should not affect existing applications but if sub-classing `Web**ConfigurationSupport` (or `DelegatingWeb**Configuration`) and using `proxyBeanMethods=false` be sure to also to declare dependent beans as method arguments rather than using method calls. See [gh-22596](https://github.com/spring-projects/spring-framework/pull/22596)

#### Deprecation of `MediaType.APPLICATION_JSON_UTF8` and `MediaType.APPLICATION_PROBLEM_JSON_UTF8`

Since the [related Chrome bug](https://bugs.chromium.org/p/chromium/issues/detail?id=438464) is now fixed since September 2017, Spring Framework 5.2 deprecates `MediaType.APPLICATION_JSON_UTF8` and `MediaType.APPLICATION_PROBLEM_JSON_UTF8` in favor of `MediaType.APPLICATION_JSON` and `MediaType.APPLICATION_PROBLEM_JSON` and uses them by default. As a consequence, integration tests relying on the default JSON content type may have to be updated. See [gh-22788](https://github.com/spring-projects/spring-framework/issues/22788) for more details.

#### CORS handling

CORS handling has been [significantly updated](https://github.com/spring-projects/spring-framework/commit/d27b5d0ab6e8b91a77e272ad57ae83c7d81d810b) in Spring Framework 5.2:
 - CORS processing is now only used for CORS-enabled endpoints
 - CORS processing for skipped for same-origin requests with an `Origin` header
 - Vary headers are added for non-CORS requests on CORS endpoints

These changes introduce an `AbstractHandlerMapping#hasCorsConfigurationSource` method (in both Spring MVC and WebFlux) in order to be able to check CORS endpoints efficiently. When upgrading to Spring Framework 5.2, handler mapping extending `AbstractHandlerMapping` and supporting CORS should override `hasCorsConfigurationSource` with their custom logic.

#### Use of Path Extensions Deprecated in Spring MVC

Config options for suffix pattern matching in `RequestMappingHandlerMapping` have been deprecated, and likewise config options to resolve acceptable media types from the extension of a request path in `ContentNegotiationManagerFactoryBean` have also been deprecated. This is aligned with defaults in Spring Boot auto configuration and Spring WebFlux does not offer such options. See [gh-24179](https://github.com/spring-projects/spring-framework/issues/24179) and related issues for details and further plans towards 5.3.

#### `Encoder` Contract

Custom implementations of `Encoder` must implement the new [encodeValue](https://github.com/spring-projects/spring-framework/blob/13183c89ce1eb178793e542753cd78f3d9908164/spring-core/src/main/java/org/springframework/core/codec/Encoder.java#L85) which is invoked from `ServerSentEventHttpMessageWriter` or otherwise that would fail at runtime.


### Testing

The mock JNDI support in the `spring-test` module has been deprecated. If you have been using classes such as the `SimpleNamingContext` and `SimpleNamingContextBuilder`, you are encouraged to migrate to a complete JNDI solution from a third party such as [Simple-JNDI](https://github.com/h-thurow/Simple-JNDI). [[gh-22779]](https://github.com/spring-projects/spring-framework/issues/22779)


## New and Noteworthy

### General Core Revision

* Upgrade to ASM 7.1 and Kotlin 1.3.
* Annotation retrieval optimizations:
  * New `MergedAnnotations` API for efficient sophisticated annotation retrieval checks.
  * Candidate class mechanism for indications about the potential presence of certain annotation types.
* Commons Logging conveniences:
  * `LogMessage` for first-class message supplier and argument-based formatting support.
  * `LogAccessor` as a convenient `Log` alternative with out-of-the-box support for message suppliers.

### Core Container

* `@Configuration` model improvements:
  * Optimized annotation introspection on configuration candidate classes.
  * `proxyBeanMethods` attribute for `@Configuration`-demarcated classes in lite mode, i.e. without CGLIB subclasses.
  * Support for annotation detection on factory methods with common `ListableBeanFactory` retrieval methods: `getBeanNamesForAnnotation`, `getBeansWithAnnotation`, `findAnnotationOnBean`.
* [Bean registration with Kotlin DSL](https://docs.spring.io/spring/docs/current/spring-framework-reference/languages.html#kotlin-bean-definition-dsl) using callable reference with autowired parameters.

### Transaction Management

* Support for reactive transaction management on Reactive Streams Publishers
  * `ReactiveTransactionManager` SPI as alternative to `PlatformTransactionManager`.
  * Programmatic `TransactionalOperator` as well as `@Transactional` integration.
* Support for transaction control via Vavr `Try` return type on `@Transactional` methods.

### General Web Revision

* Complete set of `java.time` based setters on `HttpHeaders`, `CacheControl`, `CorsConfiguration`.
* `@RequestMapping` has enhanced
[produces condition](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestMapping.html#produces--)
support such that if a media type is declared with a specific parameter, and the requested media types (e.g. from "Accept" header) also has that parameter, the parameter values must match. This can be used for example to differentiate methods producing ATOM feeds `"application/atom+xml;type=feed"` vs ATOM entries `"application/atom+xml;type=entry"`.
* CORS revision that adds `Vary` header for non CORS requests on CORS enabled endpoints and avoid considering same-origin requests with an `Origin` header as a CORS request.
* Upgrade to Jackson 2.10 

### Spring Web MVC

* New "WebMvc.fn" programming model, analogous to the existing "WebFlux.fn":
  * A functional alternative to annotated controllers built on the Servlet API.
  * [WebMvc.fn Kotlin DSL](https://docs.spring.io/spring/docs/current/spring-framework-reference/languages.html#router-dsl).
* Request mapping performance optimizations through caching of the lookup path per `HandlerMapping`, and pre-computing frequently used data in `RequestCondition` implementations.
* Improved, compact logging of request mappings on startup.

### Spring WebFlux

* Refinements to `WebClient` API to make the `retrieve()` method useful for most common cases, specifically adding the ability to retrieve status and headers and addition to the body. The `exchange()` method is only for genuinely advanced cases, and when using it, applications can now rely on `ClientResponse#createException` to simplify selective handling of exceptions.
* Configurable limits on input stream processing in all `Decoder` and `HttpMessageReader` implementations, with `maxInMemorySize` set to 256K by default. See WebFlux reference for details.
* [Support for Kotlin Coroutines](https://docs.spring.io/spring/docs/current/spring-framework-reference/languages.html#coroutines).
* Server and client now use Reactor [checkpoints](https://projectreactor.io/docs/core/release/reference/#_the_checkpoint_alternative) to insert information about the request URL being processed,sce or the handler used, that is then inserted into exceptions and logged below the exception stacktrace.
* Request mapping performance optimizations through pre-computing frequently used data in `RequestCondition` implementations.
* Header management performance optimizations by wrapping rather than copying server headers, and caching parsed representations of media types. Available from 5.1.1, see issue [#21783](https://github.com/spring-projects/spring-framework/issues/21783) and commits under "Issue Links".
* Improved, compact logging of request mappings on startup.
* Add `ServerWebExchangeContextFilter` to expose the
[Reactor Context](https://projectreactor.io/docs/core/release/reference/#context) as an exchange attribute.
* Add FreeMarker macros support.
* `MultipartBodyBuilder` improvements to allow `Publisher` and `Part` as input along with option to specify the filename to use for a part.

### Spring Messaging

* [RSocket](https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html#rsocket) support:
  * Response handling via annotated `@MessageMapping` methods.
  * Performing requests via `RSocketRequester` with encoding and decoding to and from higher-level objects.
  * [Support for Kotlin Coroutines](https://docs.spring.io/spring/docs/current/spring-framework-reference/languages.html#coroutines).

### Testing

* JUnit Jupiter 5.5.2 support.
* New `@TestConstructor` annotation and `spring.test.constructor.autowire.mode` JVM system property for configuring the [autowiring mode for test constructors](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#integration-testing-annotations-testconstructor) when using JUnit Jupiter.
* Support for built-in [test execution events](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#testcontext-test-execution-events).
* `@TestPropertySource` can now be used as a [repeatable annotation](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#declaring-test-property-sources).
* Class-level and method-level `@Sql` declarations can now be [merged](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#testcontext-executing-sql-declaratively-script-merging).
* `@SqlConfig` now supports [multiple comment prefixes](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/test/context/jdbc/SqlConfig.html#commentPrefixes--) for scripts configured via `@Sql`.
* Enhancements to the `TestContext` API:
  * New [`hasApplicationContext()`](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/test/context/TestContext.html#hasApplicationContext--) method to determine if the application context for the current test is known to be available.
  * New [`publishEvent()`](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/test/context/TestContext.html#publishEvent-java.util.function.Function-) method for simplified `ApplicationEvent` publication.
* Improved support for setting cookie headers in `MockHttpServletResponse`.
* `MockMvcResultMatchers.jsonPath()` now supports a target type.
* [MockMvc Kotlin DSL](https://docs.spring.io/spring/docs/current/spring-framework-reference/languages.html#mockmvc-dsl)
* New `headerDoesNotExist()` method in `MockRestServiceServer` to verify that a header does not exist.
* `ReflectionTestUtils` supports the invocation of `static` methods via new [`invokeMethod()`](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/test/util/ReflectionTestUtils.html#invokeMethod-java.lang.Class-java.lang.String-java.lang.Object...-) variants.

### Documentation

* Code samples in the [reference documentation](https://docs.spring.io/spring/docs/current/spring-framework-reference) are now provided in Kotlin in addition to Java

To see all changes, please check the release notes for individual milestones:
* [5.2 GA](https://github.com/spring-projects/spring-framework/releases/tag/v5.2.0.RELEASE)
* [5.2 RC2](https://github.com/spring-projects/spring-framework/releases/tag/v5.2.0.RC2)
* [5.2 RC1](https://github.com/spring-projects/spring-framework/releases/tag/v5.2.0.RC1)
* [5.2 M3](https://github.com/spring-projects/spring-framework/releases/tag/v5.2.0.M3)
* [5.2 M2](https://github.com/spring-projects/spring-framework/releases/tag/v5.2.0.M2)
* [5.2 M1](https://github.com/spring-projects/spring-framework/releases/tag/v5.2.0.M1)