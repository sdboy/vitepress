_Note that Spring Framework 4.3.x and therefore Spring Framework 4 overall reached its EOL cut-off on December 31st, 2020. The Spring Framework 5.x generation will reach its end of OSS support on August 31st, 2024. Please upgrade to [a supported generation or consider a commercial subscription](https://spring.io/projects/spring-framework#support)!_

_See also the [[Spring-Framework-5-FAQ]]._

## Upgrading From Spring Framework 5.0

### JDK 11

Spring Framework 5.1 requires JDK 8 or higher and specifically supports JDK 11 (as the next long-term support release) for the first time. We strongly recommend an upgrade to Spring Framework 5.1 for any applications targeting JDK 11, delivering a warning-free experience on the classpath as well as the module path.

Please note that developing against JDK 11 is not officially supported with any older version of the core framework. Spring Framework 5.0.9+ and 4.3.19+ just support deploying Java 8 based applications to a JVM 11 runtime environment (using `-target 1.8`; see below), accepting JVM-level warnings on startup.

#### ASM

Spring Framework 5.1 uses a patched ASM 7.0 fork which is prepared for JDK 11/12 and their new bytecode levels but not battle-tested yet. Spring Framework 5.1.x will track further ASM revisions on the way to JDK 12, also hardening bytecode compatibility with JDK 11.

For a defensive upgrade strategy, consider compiling your application code with JDK 8 as a target (`-target 1.8`), simply deploying it to JDK 11. This makes your bytecode safer to parse not only for Spring's classpath scanning but also for other bytecode processing tools.

#### CGLIB

Spring Framework 5.1 uses a patched CGLIB 3.2 fork that delegates to JDK 9+ API for defining classes at runtime. Since this code path is only active when actually running on JDK 9 or higher (in particular necessary on JDK 11 where an alternative API for defining classes has been removed), side effects might show up when upgrading existing applications to JDK 11.

Spring has a fallback in place which tries to mitigate class definition issues, possibly leading to a JVM warning being logged, whereas the standard code path delivers a warning-free experience on JDK 11 for regular class definition purposes. Consider revisiting your class definitions and bytecode processing tools in such a scenario, upgrading them to JDK 11 policies.

### Core Container

The core container has been fine-tuned for Graal compatibility (native images on Substrate VM) and generally optimized for less startup overhead and less garbage collection pressure. As part of this effort, several introspection algorithms have been streamlined towards avoiding unnecessary reflection steps, potentially causing side effects for annotations declared outside of well-defined places.

#### Nested Configuration Class Detection

As per their original definition, nested configuration classes are only detected on top-level `@Configuration` or other `@Component`-stereotyped classes now, not on plain usage of `@Import` or `@ComponentScan`. Older versions of Spring over-introspected nested classes on non-stereotyped classes, causing significant startup overhead in some scenarios.

In case of accidentally relying on nested class detection on plain classes, simply declare those containing classes with a configuration/component stereotype.

### Web Applications

#### Forwarded Headers

`"Forwarded"` and `"X-Forwarded-*"` headers, which reflect the client's original address, are no longer checked individually in places where they apply, e.g. same origin CORS checks, `MvcUriComponentsBuilder`, etc. 

Applications [are expected](https://jira.spring.io/browse/SPR-16668) to use one of:
* Spring Framework's own `ForwardedHeaderFilter`.
* Support for forwarded headers from the HTTP server or proxy.

Note that `ForwardedHeaderFilter` can be configured in a safe mode where it checks and discards such headers so they cannot impact the application.

#### Encoding Mode of `DefaultUriBuilderFactory`

The encoding mode of `DefaultUriBuilderFactory` has been switched to enforce stricter encoding of URI variables by default. This could impact any application using the `WebClient` with default settings, or any application using `DefaultUriBuilderFactory` directly. See the ["Encoding URIs"](https://docs.spring.io/spring/docs/5.1.0.BUILD-SNAPSHOT/spring-framework-reference/web.html#web-uri-encoding) section and also the [Javadoc](https://docs.spring.io/spring/docs/5.1.0.BUILD-SNAPSHOT/javadoc-api/org/springframework/web/util/DefaultUriBuilderFactory.html#setEncodingMode-org.springframework.web.util.DefaultUriBuilderFactory.EncodingMode-) for `DefaultUriBuilderFactory#setEncodingMode`.

#### Content Negotiation for Error Responses

The produces condition of an `@RequestMapping` no longer [impacts](https://jira.spring.io/browse/SPR-16318) the content type of error responses.

#### Multipart and Query Values

The integration with Apache Commons FileUpload [now aggregates](https://jira.spring.io/browse/SPR-16590) multipart parameter values with other request parameters from the query, as required by Servlet spec, section 3.1. Previously it returned only multipart parameter values if present.

#### HTTP OPTIONS

The built-in support for HTTP OPTIONS in `@RequestMapping` methods now consistently [adds HTTP OPTIONS](https://jira.spring.io/browse/SPR-16513) as one of the supported HTTP methods, whereas previously it did not.


## New and Noteworthy

### General Core Revision

* Infrastructure:
  * Warning-free support for JDK 11 on the classpath and the module path.
  * Support for Graal native image constraints (reflection, parameter names).
  * Upgrade to Reactor Core 3.2 and Reactor Netty 0.8 ("Reactor Californium").
  * Upgrade to ASM 7.0 and CGLIB 3.2.8.
* Core facilities:
  * NIO.2 Path support in FileSystemResource (superseding PathResource).
  * Performance improvements for core type and annotation resolution.
  * Consistent detection of method annotations on generic interfaces.
* Logging revision:
  * Spring's JCL bridge can be detected by standard Commons Logging.
  * Less noise on info, readable debug logs, details at trace level.

### Core Container

* Bean definitions:
  * Support for logical and/or expressions in @Profile conditions.
  * Consistent (non-)detection of nested configuration classes.
  * Refined Kotlin beans DSL.
    * Unique implicit bean names for multiple beans of same type.
* Bean retrieval:
  * Consistent non-exposure of null beans in the BeanFactory API.
  * Programmatic ObjectProvider retrieval through the BeanFactory API.
  * ObjectProvider iterable/stream access for beans-of-type resolution.
  * Empty collection/map/array injection in single constructor scenarios.

### General Web Revision

* Controller parameter annotations get detected on interfaces as well:
  * Allowing for complete mapping contracts in controller interfaces.
* Support for stricter encoding of URI variables in `UriComponentsBuilder`:
  * See updated ["URI Encoding"](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#web-uri-encoding) in the reference.
* Servlet requests params with HTTP PUT, PATCH, and DELETE:
  * See ["Form Data"](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#filters-http-put).

### Spring Web MVC

* Logging
  * Improved, human-friendly, compact, DEBUG and TRACE logging.
  * Control over DEBUG logging of potentially sensitive data.
    * via `DispatcherServlet#enableLoggingRequestDetails`
* Updated web locale representation:
  * Language tag compliant by default.
  * CookieLocaleResolver sends RFC6265-compliant timezone cookies.
* Specific MVC exceptions for missing header, cookie, path variable:
  * Allowing for differentiated exception handling and status codes.
* [Externally configured](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-config-path-matching) base path for sets of annotated controllers.
* Centralized handling of "forwarded" type headers via `ForwardedHeaderFilter`:
  * Please see important [upgrade note](https://github.com/spring-projects/spring-framework/wiki/Upgrading-to-Spring-Framework-5.x#forwarded-headers).
* Support for serving Brotli, in addition to GZip, pre-encoded static resources.

### Spring WebFlux

* HTTP/2 server support when running with Reactor Netty 0.8.
* Logging
  * Improved, human-friendly, compact, DEBUG and TRACE logging.
  * Correlated log messages for HTTP requests and WebSocket sessions.
  * Control over DEBUG logging of potentially sensitive data.
    * via `CodecConfigurer#defaultCodecs`
* Configurable limits on input stream processing in all `Decoder` and `HttpMessageReader` implementations, which by default are not set in 5.1 with the exception of `FormHttpMessageReader` which does limit input to 256K. Note that in 5.2 `maxInMemorySize` property for all codecs is set to 256K.
* Session cookies now have `SameSite=Lax` to protect against CSRF attacks:
  * See [OWASP page](https://www.owasp.org/index.php/SameSite) and [this article](https://scotthelme.co.uk/csrf-is-dead/).
* Cookies are no longer adapted to cookie objects from the underlying server API, and are instead written to the `Set-Cookie` header directly because most servers don't support `sameSite`. This change includes validations to cookie attribute values that may differ slightly from similar validations previously applied by the server. The validations however do conform to the syntax from RFC 6265, section 4.1. See [#23693](https://github.com/spring-projects/spring-framework/issues/23693).
* DSL enhancements:
  * DSL-style builder for `RouterFunction` without static imports ([sample](https://github.com/spring-projects/spring-framework/blob/91e96d8084acb7d92a1a2f086f30cd3381b26440/spring-webflux/src/test/java/org/springframework/web/reactive/function/server/RouterFunctionBuilderTests.java#L157-L179)).
  * Refined Kotlin router DSL.
* [Externally configured](https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html#webflux-config-path-matching) base path for sets of annotated controllers.
* Third-party integration:
  * Support for Protobuf serialization, including [message streaming](https://developers.google.com/protocol-buffers/docs/techniques).
  * `WebClient` connector for the Jetty reactive [HTTP Client](https://webtide.com/jetty-reactivestreams-http-client/).
* WebSocket:
  * Support for `WebSocketSession` attributes.
  * Improve docs on reactive [WebSocket API](https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html#webflux-websocket-server) handling.
* Support for serving Brotli, in addition to GZip, pre-encoded static resources.

### Spring Messaging

* Support for reactive clients in @MessageMapping methods:
  * Out-of-the-box support for Reactor and RxJava return values.
* [Option to preserve](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#websocket-stomp-ordered-messages) publication order of messages by STOMP broker.
* `@SendTo` and `@SendToUser` can [both be used](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#websocket-stomp-message-mapping) on controller method.
* Improved docs on [handling](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#websocket-stomp-handle-annotations) of messages and [subscriptions](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#websocket-stomp-subscribe-mapping).

### Spring ORM

* Support for Hibernate ORM 5.3:
  * Bean container integration with Hibernate's new SPI.
* LocalSessionFactoryBean and HibernateTransactionManager support JPA interaction:
  * Allowing for native Hibernate as well as JPA access within the same transaction.
* Read-only transactions do not retain Hibernate entity snapshots in memory anymore:
  * Session.setDefaultReadOnly(true) by default.
* SAP HANA as a common JpaVendorAdapter database platform.

### Testing

* Hamcrest and XML assertions in `WebTestClient`.
* `MockServerWebExchange` can be configured with fixed `WebSession`.