_Note that Spring Framework 4.3.x and therefore Spring Framework 4 overall reached its EOL cut-off on December 31st, 2020. The Spring Framework 5.x generation will reach its end of OSS support on August 31st, 2024. Please upgrade to [a supported generation or consider a commercial subscription](https://spring.io/projects/spring-framework#support)!_

_See also the [[Spring-Framework-5-FAQ]]._

## Upgrading From Spring Framework 5.2

### Third-Party APIs and Libraries

For Kotlin:
* Kotlin support has been upgraded to Kotlin 1.4 and is still compatible with Kotlin 1.3+.
* Kotlin Coroutines 1.4 (which builds on Kotlin 1.4) or above is now required for coroutines support.
* For Kotlin scripting, Kotlin 1.4 users should declare the `kotlin-scripting-jsr223` dependency instead of `kotlin-scripting-jsr223-embeddable`.

Spring Framework 5.3 ships with a WildFly manifest that makes Objenesis work on JDK 9+. This is known to cause an incompatibility with WildFly 9; please upgrade to a more recent version of WildFly - or patch your copy of `spring-core.jar` to drop the `Dependencies` manifest entry.

Hibernate support has been upgraded to a Hibernate ORM 5.2+ baseline, with a focus on ORM 5.4.x. Please note that Hibernate Search needs to be upgraded to 5.11.6 for Spring Framework 5.3 JPA compatibility; see [Hibernate JIRA](https://hibernate.atlassian.net/browse/HSEARCH-4107).

Jackson support covers Jackson 2.9 to 2.12 now, generally with the latest releases in each branch.

Groovy 3.0 is the officially supported version now, with Groovy 2.x support getting phased out.

Support for RxJava 1.x is deprecated; RxJava 2.x is the new baseline and 3.x is now supported.

JCA CCI support is deprecated, in favor of specific data access APIs (or native CCI usage if there is no alternative).

Several remoting technologies have been deprecated with no direct replacement (Hessian, RMI, HTTP Invoker, JMS Invoker).

`MimeMessageHelper` has been aligned with JavaMail 1.5+, not explicitly encoding attachment filenames by default anymore.

### Core Container

The properties-based bean definition format and all support classes based on it (such as `PropertiesBeanDefinitionReader`, `JdbcBeanDefinitionReader` and `ResourceBundleViewResolver`) are deprecated now, in favor of Spring's common bean definition formats and/or custom reader implementations.

`InstantiationAwareBeanPostProcessorAdapter` is deprecated now, in favor of the existing default methods in `(Smart)InstantiationAwareBeanPostProcessor`.

`BeanNameAutoProxyCreator` now honors the configured `beanNames` list when applying a custom `TargetSourceCreator`. Consequently, a `BeanNameAutoProxyCreator` no longer proxies beans whose names do not match the configured `beanNames` list. See [gh-24915](https://github.com/spring-projects/spring-framework/issues/24915).

`@EventListener` methods use an implicit order value of `Ordered.LOWEST_PRECEDENCE` now, in alignment with transaction synchronizations and `@TransactionalEventListener` methods. If custom ordering is needed, please consistently declare `@Order` values on all listener methods.

Caching within the core container is consistently optimized for bean definitions with stable bean types per bean name, even for prototype beans. This is partially also the case for the 5.2.x line. Performance regressions might require some bean definition redesign; see e.g. [gh-26369](https://github.com/spring-projects/spring-framework/issues/26369).

### Data Access and Transactions

Several `JdbcTemplate` signatures with `Object[]` arguments are deprecated, in favor of their existing varargs equivalents.

`HibernateJpaVendorAdapter` exposes `Session(Factory)` as `EntityManager(Factory)` extension interface by default (following Hibernate ORM 5.2+).

`TransactionSynchronization` extends the `Ordered` interface by default now, as a replacement for the deprecated `TransactionSynchronizationAdapter`. As a consequence, `@Order` annotations on synchronization instances - which were not officially supported despite effectively working since 4.2 - do not work anymore. Synchronization objects are low-level callback objects, please express any attached order with a programmatic `getOrder` implementation.

Reactive transactions consistently roll back on a Reactive Streams cancel signal now, preventing partial commits for common datastore transactions.

### Web Applications

CORS configuration where `allowCredentials` is set to true now requires an explicit declaration of specific domains to allow via `allowedOrigins` or use of the newly added `allowedOriginPatterns`.

When using the `PathPatternParser` for request mapping, patterns with double-wildards in the middle of the pattern, such as `"/path/**/other"`, are now rejected. This parser is used by default in WebFlux applications and can be used as an opt-in for MVC applications as of Spring Framework 5.3. See [gh-24952](https://github.com/spring-projects/spring-framework/issues/24952).

The `ForwardedHeaderFilter` (Servlet) and `ForwardedHeaderTransformer` (WebFlux) have been enhanced and now support multiple values in `X-Forwarded-Prefix` and the new `X-Forwarded-For` / `Forwarded: for=` HTTP request headers. See [gh-25254](https://github.com/spring-projects/spring-framework/issues/25254) and [gh-23582](https://github.com/spring-projects/spring-framework/pull/23582).

`@ExceptionHandler` methods now check all exception causes when looking for a match. Previously, going back to 4.3 only the first cause was checked.

`@RequestParam`, `@RequestHeader`, and other controller method argument annotations that depend on type conversion from String values to other types such as `UUID`, `Long`, and others, now detect a `null` conversion result value and treat as missing. For example, a query parameter with an empty value is now treated as missing if it requires type conversion and the conversion results in `null`. In order to allow an empty value to be injected as a `null` argument, either set `required=false` on the argument annotation, e.g. `@RequestParam(required=false)`, or declare the argument as `@Nullable`.

`WebSocketConfigurationSupport` and `WebSocketMessageBrokerConfigurationSupport` have been refactored to not require CGLIB proxies, see [related commit](https://github.com/spring-projects/spring-framework/commit/017242463502f451c6c71a823b9c5232276dd78e).



### Spring MVC

`LocaleResolver`, `ThemeResolver`, `FlashMapManager` and `RequestToViewNameTranslator` beans are now declared at `WebMvcConfigurationSupport` and `DelegatingWebMvcConfiguration` level with `@Bean` annotations for improved consistency with other Spring MVC default beans and to improve GraalVM compatibility by reducing reflection done otherwise in `DispatcherServlet`. Spring Boot or XML application context based projects shouldn't be impacted, but non Spring Boot projects using JavaConfig overriding one of those default beans may require an update since the bean declaration should now happen in the configuration class annotated with `@EnableWebMvc` (still using their [well-known names](https://docs.spring.io/spring-framework/docs/5.3.x/javadoc-api/constant-values.html#org.springframework.web.servlet.DispatcherServlet.FLASH_MAP_MANAGER_BEAN_NAME)), for example for the `LocaleResolver`:
```
@Configuration
public class WebConfig extends DelegatingWebMvcConfiguration {

	@Bean
	@Override
	public LocaleResolver localeResolver() {
		return new FixedLocaleResolver(new Locale("fr", "FR"));
	}
}
```

`@RequestParam` and `@RequestPart` enforce at least one element in a `MultipartFile` and Servlet `Part` collection/array when the argument is required (i.e. not explicitly marked as optional), consistent with individual `MultipartFile`/`Part` declarations, resolving the argument to `null` otherwise.

Spring MVC no longer performs `.*` suffix pattern matching by default, and likewise path extensions are no longer used by default to interpret the requested content type (e.g. `/person.pdf`, `/person.xml`, etc). Please, see the ["Suffix Match"](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-ann-requestmapping-suffix-pattern-match) section of the reference documentation.

In case of JSON serialization errors while writing to the HTTP response, the JSON `HttpMessageConverter` will still flush to the response and clean up resources. If you were previously relying on the response not being written to, note that this was not an intended behavior and that we can't guarantee error handling for this case. See [gh-26246](https://github.com/spring-projects/spring-framework/issues/26246) for an example of that.

A `java.security.Principal` argument is no longer resolved eagerly, if it is annotated in some way such as `@AuthenticationPrincipal`, thus allowing a custom resolver to resolve it first, before using default resolution resolution via `HttpServletRequest#getUserPrincipal`. This can cause issues for existing applications that are trying to inject the Spring Security `Authentication` but also have it annotated with `@AuthenticationPrincipal` which now results in the injection of `Authentication#getPrincipal` as per the intent for the annotation. Removing `@AuthenticationPrincipal` results in the injection of the top level `Authentication` object which is also a `Principal` and would be resolved via `HttpServletRequest#getUserPrincipal` after the change.

### Spring WebFlux

`@RequestPart` with `List<T>` now converts the 1st part to `List<T>` consistent with Spring MVC and with how it works for `T[]`. Previously each part was converted to `T`, see [gh-22973](https://github.com/spring-projects/spring-framework/issues/22973).

`@EnableWebFlux` now includes a declaration of a `WebSocketHandlerAdapter` bean. It should not interfere with any declared by the application due to a lower priority but if you have one, you can remove it.

WebClient now wraps emitted exceptions in either a `WebClientRequestException`, or a `WebClientResponseException`. `CodecExceptions` are not wrapped and still propagated. as before. See [gh-23842](https://github.com/spring-projects/spring-framework/issues/23842).

A `UriComponentsBuilder` argument injected into an `@Controller` method is now application relative (i.e. it includes the contextPath) where previously it contained no path at all.

`org.synchronoss.cloud:nio-multipart-parser` is no longer a required dependency for multipart support in WebFlux. Instead, there is now the `DefaultPartHttpMessageReader` with no dependencies, see [gh-21659](https://github.com/spring-projects/spring-framework/issues/21659)

### Testing

The _Spring TestContext Framework_ now provides first-class support for inheriting and overriding test-related annotations from enclosing classes. This improves the programming model for using JUnit Jupiter `@Nested` test classes with Spring's testing support. Note, however, that annotations from enclosing classes will now be inherited by default. This is a change in behavior that may cause some of your `@Nested` test classes to fail after upgrading to Spring Framework 5.3. To revert to the behavior present in Spring Framework 5.0 - 5.2.x, you can annotate top-level, enclosing classes for your `@Nested` test classes with `@NestedTestConfiguration(OVERRIDE)`. To switch to `OVERRIDE` mode for an entire project, you can configure `spring.test.enclosing.configuration=override` via a JVM system property or an entry in a `spring.properties` file in the root of the classpath (for example, in `src/test/resources/spring.properties`).

Consult the [Javadoc for `@NestedTestConfiguration`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/test/context/NestedTestConfiguration.html) and the [reference manual](https://docs.spring.io/spring-framework/docs/current/reference/html/testing.html#testcontext-junit-jupiter-nested-test-configuration) for details.

Users of `MockMvc` Kotlin DSL could experience some breakages when using property syntax like `isOk`, `isOk()` should be used instead. There maybe be some other slight variations due to the improved Kotlin DSL, see [this commit](https://github.com/spring-projects/spring-framework/commit/d04c5f8b2cb274b8f44c47b3783e5d29f3e21b43) for more details.


## New and Noteworthy

### General Core Revision

* Upgrade to ASM 9.0 and Kotlin 1.4.
* Support for RxJava 3 in `ReactiveAdapterRegistry` while support for RxJava 1.x is deprecated.
* Improve GraalVM native support by removing unsupported features from native images.
* A `spring.spel.ignore` property to remove SpEL support for applications not using it.

### Core Container

* Binding support for Java 14/15 record classes and similarly styled constructors/accessors.
* `ObjectProvider.ifAvailable/ifUnique` explicitly ignores beans from currently inactive scopes.
* `ApplicationListener.forPayload(Consumer)` method for convenient programmatic `PayloadApplicationEvent` handling.
* Support for Quartz extensions in `CronExpression`:
    * the day-of-month field can use `L` to express the last day of the month, `nL` to express the nth-to-last day of the month, or `nW` to express the nearest weekday to day-of-month n.
    * the day-of-week field can use `DDDL` to express the last day-of-week DDD in the month, or `DDD#n` to express the nth day-of-week DDD.

### Data Access and Transactions

* New `spring-r2dbc` support module, moving core R2DBC support and the reactive `R2dbcTransactionManager` into the Spring Framework umbrella.
* New `JdbcTransactionManager` subclass of `DataSourceTransactionManager`, adding data access exception translation on commit.
* New `DataClassRowMapper` for constructor-based binding support, including Kotlin/Lombok data classes and Java 14/15 record classes.
* Support for `queryForStream` on `JdbcTemplate`, allowing for lazy iteration over a closeable `java.util.stream.Stream`.
* Configurable EntityManager/Session initializers on `Jpa/HibernateTransactionManager` and `Local(Container)EntityManagerFactoryBean`.
* `HibernateJpaVendorAdapter` exposes Hibernate ORM 5.2+ conventions by default (e.g. `SessionFactory` as EMF vendor interface).
* Transaction definitions may declare custom labels now (for use in custom transaction managers).
* Support for timeout values with `${...}` placeholders in transaction definitions.
* `TransactionalApplicationListener` interface with `forPayload` factory methods, callback support, and adapter classes for programmatic registration (as an alternative to `@TransactionalEventListener` annotated methods).
* Support for `@Transactional` suspending functions (Kotlin Coroutines)

### Spring Messaging

* `RSocketRequester` support for the new `RSocketClient` as a result of which an `RSocketRequester` can be obtained as an instance, i.e. without a `Mono` wrapper or the need to connect first. A connection is transparently obtained as requests are made including support for reconnecting.
* `RSocketRequester` support for the new `LoadbalanceRSocketClient`.
* `RSocketRequester` support for metadataPush interactions.
* The `preservePublishOrder` option for STOMP/WebSocket applications now works in combination with send buffer size and time limits.
* Support for [Kotlin multiplatform serialization](https://docs.spring.io/spring-framework/docs/current/reference/html/languages.html#kotlin-multiplatform-serialization) (JSON only for now)

### General Web Revision

* CORS configuration exposes a new `allowedOriginPatterns` property for declaring a dynamic range of domains via wildcard patterns.
* `RequestEntity` supports URI templates with variables.
* `Jackson2ObjectMapperBuilder` exposes `Consumer<ObjectMapper>` option for advanced customizations.
* `DataBinder` allows switching between direct field and bean property access during initialization. An example scenario is an `@ControllerAdvice` configuring direct field access by default globally with some controllers overriding that locally, via `@InitBinder` method, to bean property access.
* A `spring.xml.ignore` property to remove XML support for applications not using it, including related converters and codecs.

### Spring MVC
 
* Efficient URL matching with parsed `PathPattern`'s in Spring MVC; see "URI Patterns" in the "Web Servlet" section of the documentation and blog post ["URL Matching with PathPattern in Spring MVC"](https://spring.io/blog/2020/06/30/url-matching-with-pathpattern-in-spring-mvc).
* `UrlPathHelper` checks the `HttpServletMapping` (Servlet 4.0) for a more efficient determination of the application path, see [#25100](https://github.com/spring-projects/spring-framework/issues/25100).
* `@ControllerAdvice` can handle exceptions from any handler type (i.e. not just `@Controller` but others like `HttpRequestHandler`, `HandlerFunction`, etc) as long as it matches the handler mappings set on `ExceptionHandlerExceptionResolver`. 
* `@ExceptionHandler` can target exception causes at any level of nesting.
* `ForwardedHeaderFilter` updates the remote address/port from "Forwarded For" headers.
* Add missing beans to `WebMvcConfigurationSupport` in order to make `DispatcherServlet.properties` (now lazily parsed) not needed for most use cases.
* Support for [Kotlin multiplatform serialization](https://docs.spring.io/spring-framework/docs/current/reference/html/languages.html#kotlin-multiplatform-serialization) (JSON only for now)

### Spring WebFlux

* New `DefaultPartHttpMessageReader` provides a fully reactive message reader that converts a buffer stream into a `Flux<Part>`
* New `PartHttpMessageWriter` to write the `Flux<Part>` received from a client to a remote service.
* New `WebClient` connector for [Apache Http Components](https://hc.apache.org/httpcomponents-client-5.0.x/).
* `WebClient` and `ClientRequest` provide access to the `ClientHttpRequest` and the native request. This is useful for customizing per-request options specific to the HTTP library.
* `Encoder` and `Decoder` implementations for Netty `ByteBuf`.
* `ForwardedHeaderTransformer` updates the remote address/port from "Forwarded For" headers.
* `@EnableWebFlux` enables support for handlers of type `WebSocketHandler`.
* `WebSocketSession` provides access to the `CloseStatus`.
* `WebHttpHandlerBuilder` option to decorate the entire `WebFilter` chain at the level of the `HttpHandler`. 
* More efficient direct path lookups for `@RequestMapping` methods that don't have any patterns or URI variables.
* `ClientResponse` performance optimizations and `mutate()` method for efficient changes through a client filter or `onStatus` handler, see [#24680](https://github.com/spring-projects/spring-framework/issues/24680).
* Support for [Kotlin multiplatform serialization](https://docs.spring.io/spring-framework/docs/current/reference/html/languages.html#kotlin-multiplatform-serialization) (JSON only for now)

### Testing

* The _Spring TestContext Framework_ is now built and tested against JUnit Jupiter 5.7, JUnit 4.13.1, and TestNG 7.3.0.
* Test-related annotations on enclosing classes are now _inherited_ by default for JUnit Jupiter `@Nested` test classes.
  * This is a potentially breaking change, but the behavior can be reverted to _override_ configuration from enclosing classes via the `@NestedTestConfiguration` annotation, a JVM system property, or an entry in a `spring.properties` file in the root of the classpath.
  * Consult the [Javadoc for `@NestedTestConfiguration`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/test/context/NestedTestConfiguration.html) and the [reference manual](https://docs.spring.io/spring-framework/docs/current/reference/html/testing.html#testcontext-junit-jupiter-nested-test-configuration) for details.
* The `spring.test.constructor.autowire.mode` property can now be set via a JUnit Platform configuration parameter to change the default `@TestConstructor` autowiring mode — for example, via the
`junit-platform.properties` file.
* A `PlatformTransactionManager` configured via the `TransactionManagementConfigurer` API now takes precedence over any transaction manager configured as a bean in the `ApplicationContext` unless `@Transactional` is configured with a qualifier for the explicit transaction manager to use in tests.
* Test-managed transactions may now be disabled via `@Transactional(propagation = NEVER)` in addition to the existing support for `propagation = NOT_SUPPORTED` — for example, to override a `@Transactional` declaration from a composed annotation, on a superclass, etc.
* `WebTestClient` support for performing requests against `MockMvc`. This enables the possibility to use the same API for `MockMvc` tests and for full HTTP tests. See the updated section on testing in the reference documentation.
* `WebTestClient` has improved support for asserting all values of a header.
* Multipart data matchers in the [client-side REST test](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#spring-mvc-test-client) support for the `RestTemplate`.
* HtmlUnit integration for Spring MVC Test supports file upload parameters.
* Minor enhancements to `MockHttpServletResponse` regarding character encoding and multiple `Content-Language` header values.
* Major revision of MockMVC Kotlin DSL to support multiple matchers