## TLS considerations

The HTTP/2 spec and the browser implementations bring new security constraints compared to existing secure HTTP/1.1 applications:

* TLS 1.2, SNI and ALPN, all required to upgrade to HTT/2 protocol
* a secure server certificate - usually with a strong signature algorithm and a key 2048+ bits key
* all the [TLS requirements listed in the HTTP/2 specification](https://httpwg.org/specs/rfc7540.html#TLSUsage)

TLS 1.2 isn't natively supported by JDK8, but it is in JDK8u252+ and JDK9; also, alternative TLS implementations (including native bindings) are popular because they can offer performance gains compared to the JDK stack. This part explains why containers offer various deployment options and each has its pros/cons.

## Container configuration

### Apache Tomcat

As of version 8.5, Tomcat supports HTTP/2 with both JDK8 (using Tomcat Native) and JDK9 (with native JSSE).
Servlet 4.0 is supported as of Tomcat 9.

If you'd like to use native bindings (Tomcat Native and OpenSSL), please follow [Tomcat's installation instructions](https://tomcat.apache.org/tomcat-8.5-doc/apr.html#Installation) or use you favorite package manager to install those libraries. Note that you should make sure to use the right Tomcat Native and OpenSSL versions, compatible with the version of your Tomcat server.

Then you need to configure your [Tomcat Connector accordingly](https://tomcat.apache.org/tomcat-8.5-doc/ssl-howto.html) (using the `Http11NioProtocol` and `JSSEImplementation` should work in most cases) and [configure HTTP/2 as an upgrade protocol](https://tomcat.apache.org/tomcat-8.5-doc/config/http2.html).

### Eclipse Jetty

Jetty supports several deployment modes, offering different ways to support TLS 1.2 and ALPN:
* by patching JDK8's ALPN implementation using a boot classpath jar; see [Jetty ALPN Agent](https://github.com/jetty-project/jetty-alpn-agent) and [the ALPN reference doc chapter](https://www.eclipse.org/jetty/documentation/current/alpn-chapter.html)
* by using native bindings with [Conscrypt](https://www.conscrypt.org/) - see [the official blog post](https://webtide.com/conscrypting-native-ssl-for-jetty/) for more on this

If you're running Jetty in standalone mode (i.e. Jetty's distribution), [the reference documentation is quite explicit](https://www.eclipse.org/jetty/documentation/current/http2.html).

If you're using Jetty as an embedded server, the [samples folder in Jetty's repository](https://github.com/eclipse/jetty.project/tree/jetty-9.4.x/examples/embedded/src/main/java/org/eclipse/jetty/embedded) has an HTTP2Server example.

### Undertow

With Undertow 1.3, developers needed to use [Jetty's ALPN Agent](https://github.com/jetty-project/jetty-alpn-agent) to run their server with ALPN support. As of Undertow 1.4, you can enable HTTP/2 support with a single option (see [reference documentation](https://undertow.io/undertow-docs/undertow-docs-1.4.0/index.html#http2-listener)).

### Reactor Netty

As of Spring Framework 5.1 (Reactor Netty 0.8), this server supports as well HTTP/2.
JDK9+ deployments will support that protocol without specific infrastructure changes.

For JDK 8 environments, or for optimal runtime performance, this server also supports HTTP/2 with native libraries. To enable that, your application needs to have an additional dependency.

Spring Boot manages the version for the `io.netty:netty-tcnative-boringssl-static` "uber jar", containing native libraries for all platforms. Developers can choose to import only the required dependendencies using a classifier (see the [Netty official documentation](https://netty.io/wiki/forked-tomcat-native.html)).