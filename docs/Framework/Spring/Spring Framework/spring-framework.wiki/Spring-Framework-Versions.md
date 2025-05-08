_This document describes new features, noteworthy changes, and provides guidance on upgrading from earlier versions. If you see anything missing or inaccurate, please submit a pull-request against individual pages, or [create an issue](https://github.com/spring-projects/spring-framework/issues)._

# Supported Versions

- 7.0.x will be the next major generation (November 2025).
- 6.2.x is the upcoming feature branch (November 2024).
- 6.1.x is the main production line as of November 2023.
- 6.0.x was the start of a new framework generation in November 2022, with a JDK 17 and Jakarta EE 9 baseline. Open source support ended on August 31st, 2024; commercial support options remain available.
- 5.3.x was the final feature branch of the 5th generation, with long-term support provided on JDK 8, JDK 11, JDK 17, JDK 21 and the Java EE 8 level. Open source support ended on August 31st, 2024; commercial support options remain available.
- _4.3.x reached its official EOL (end-of-life) on December 31st, 2020. No further maintenance and security patches are planned in that line._
- _3.2.x reached its official EOL (end-of-life) on December 31st, 2016. No further maintenance and security patches are planned in that line._

At this point, we recommend upgrading to the latest Spring Framework 6.1.x release from Maven Central when possible.

You'll find more [information on official support dates on spring.io](https://spring.io/projects/spring-framework#support).

# JDK Version Range

- Spring Framework 7.0.x: JDK 17-27 (expected)
- Spring Framework 6.2.x: JDK 17-25 (expected)
- Spring Framework 6.1.x: JDK 17-23
- Spring Framework 6.0.x: JDK 17-21
- Spring Framework 5.3.x: JDK 8-21 (as of 5.3.26)

We fully test and support Spring on Long-Term Support (LTS) releases of the JDK: currently JDK 8, JDK 11, JDK 17, and JDK 21. Additionally, there is support for intermediate releases such as JDK 18/19/20 on a best-effort basis, meaning that we accept bug reports and will try to address them as far as technically possible but won't provide any service level guarantees. We recommend JDK 17 and 21 for production use with Spring Framework 6.x as well as 5.3.x.

# Java/Jakarta EE Versions

- Spring Framework 7.0.x: Jakarta EE 11 (jakarta namespace)
- Spring Framework 6.2.x: Jakarta EE 9-10 (jakarta namespace)
- Spring Framework 6.1.x: Jakarta EE 9-10 (jakarta namespace)
- Spring Framework 6.0.x: Jakarta EE 9-10 (jakarta namespace)
- Spring Framework 5.3.x: Java EE 7-8 (javax namespace)

The last specification version supported by Spring Framework 5.3.x is the javax-based Java EE 8 (Servlet 4.0, JPA 2.2, Bean Validation 2.0). As of Spring Framework 6.0, the minimum is Jakarta EE 9 (Servlet 5.0, JPA 3.0, Bean Validation 3.0), with the latest Jakarta EE 10 (Servlet 6.0, JPA 3.1) recommended.

# What's New

- [[6th generation|What's New in Spring Framework 6.x]]
- [[5th generation|What's New in Spring Framework 5.x]] and [[Spring Framework 5 FAQ]]
- [4th generation](https://docs.spring.io/spring-framework/docs/4.3.x/spring-framework-reference/htmlsingle/#spring-whats-new) (4.3.x reference)

# Upgrade Considerations

- [[Upgrading to Spring Framework 6.0 and 6.1|Upgrading to Spring Framework 6.x]]
- [[Upgrading to Spring Framework 5.0, 5.1, 5.2 and 5.3|Upgrading to Spring Framework 5.x]]
- [[Upgrading to Spring Framework 4.3|Upgrading to Spring-Framework 4.x]]