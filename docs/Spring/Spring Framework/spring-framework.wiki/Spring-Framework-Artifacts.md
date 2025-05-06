_This document describes how to access Spring Framework artifacts. For examples of Maven POM and Gradle configuration see the Maven Central, Spring Repositories, and Spring Boot Dependency Management sections below._

The Spring Framework is modular and publishes 20+ different artifacts (JARs):

````
spring-aop              spring-core        spring-jms        spring-tx
spring-aspects          spring-core-test   spring-messaging  spring-web
spring-beans            spring-expression  spring-orm        spring-webflux
spring-context          spring-instrument  spring-oxm        spring-webmvc
spring-context-indexer  spring-jcl         spring-r2dbc      spring-websocket
spring-context-support  spring-jdbc        spring-test
````

Some modules are interdependent. For example `spring-context` depends on `spring-beans` which in turn depends on `spring-core`. There are no required external dependencies, although each module has optional dependencies, and some of those may be required depending on what functionality the application needs.

There is no single "spring-all" artifact that includes all modules.

> **NOTE**: The examples in the Maven Central and Spring Repositories sections of this document assume that you are manually configuring individual dependencies on Spring Framework artifacts. However, if you are using a dependency management tool, please consult the documentation for that specific tool. If you are using Spring Boot, please consult the Spring Boot Dependency Management section at the end of this document.

## Maven Central

The Spring Framework publishes GA (general availability) versions to [Maven Central](https://central.sonatype.com/) which is automatically searched when using Maven or Gradle, so just add the desired dependencies to your project's build script.

The following demonstrate how to add a dependency on version `6.2.0` of the `spring-context` artifact. Similar configuration can be applied for any of the other Spring Framework artifacts listed above.

### Maven

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>6.2.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'org.springframework:spring-context:6.2.0'
```

## Spring Repositories

Snapshot, milestone, and release candidate versions are published to an [Artifactory](https://www.jfrog.com/artifactory/) instance hosted by [JFrog](https://www.jfrog.com). You can use the Web UI at https://repo.spring.io to browse the Spring Artifactory, or go directly to one of the repositories listed below.

### Snapshot Repository Configuration

Add the following to enable your build tool to resolve snapshot versions.

#### Maven

```xml
<repositories>
  <repository>
    <id>spring-snapshots</id>
    <name>Spring Snapshots</name>
    <url>https://repo.spring.io/snapshot</url>
    <releases>
      <enabled>false</enabled>
    </releases>
  </repository>
</repositories>
```

#### Gradle

```groovy
repositories {
    mavenCentral()
    maven {
        url "https://repo.spring.io/snapshot"
    }
}
```

### Snapshot Dependency Configuration

The following demonstrate how to add a dependency on version `6.2.1-SNAPSHOT` of the `spring-context` artifact. Similar configuration can be applied for any of the other Spring Framework artifacts listed above.

#### Maven

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>6.2.1-SNAPSHOT</version>
</dependency>
```

#### Gradle

```groovy
dependencies {
    implementation 'org.springframework:spring-context:6.2.1-SNAPSHOT'
}
```

### Milestone and Release Candidate Repository Configuration

Add the following to enable your build tool to resolve milestone (M) and release candidate (RC) versions.

#### Maven

```xml
<repositories>
  <repository>
    <id>spring-milestones</id>
    <name>Spring Milestones</name>
    <url>https://repo.spring.io/milestone</url>
    <snapshots>
      <enabled>false</enabled>
    </snapshots>
  </repository>
</repositories>
```

#### Gradle

```groovy
repositories {
    mavenCentral()
    maven {
        url "https://repo.spring.io/milestone"
    }
}
```

### Milestone and Release Candidate Dependency Configuration

The following demonstrate how to add a dependency on milestone version `7.0.0-M1` of the `spring-context` artifact. Similar configuration can be applied for any of the other Spring Framework artifacts listed above.

Note that release candidate versions such as `7.0.0-RC1` can be configured in the same manner.

#### Maven

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>7.0.0-M1</version>
</dependency>
```

#### Gradle

```groovy
dependencies {
    implementation 'org.springframework:spring-context:7.0.0-M1'
}
```

## Spring Boot Dependency Management

If you need to override the version of a dependency used in your Spring Boot application, you have to override the exact name of the [version property](https://docs.spring.io/spring-boot/appendix/dependency-versions/properties.html#appendix.dependency-versions.properties) defined in the bill of materials (BOM) used by the Spring Boot plugin. For example, the name of the Spring Framework version property in Spring Boot is `spring-framework.version`.

For details on how to change a dependency version using Spring Boot's build plugins, see the official documenation for the [Maven](https://docs.spring.io/spring-boot/maven-plugin/using.html#using.parent-pom) and [Gradle](https://docs.spring.io/spring-boot/gradle-plugin/managing-dependencies.html) build plugins.

The following demonstrate how to configure Spring Boot's build plugins to use version `6.2.0` for all Spring Framework artifacts used in the project. If you have configured support for snapshot, milestone, or release candidate repositories (as explained above), you can substitute `6.2.0` with `6.2.1-SNAPSHOT`, `7.0.0-M1`, `7.0.0-RC1`, and so forth.

#### Maven

```xml
<properties>
    <spring-framework.version>6.2.0</spring-framework.version>
</properties>
```

#### Gradle

```groovy
ext['spring-framework.version'] = '6.2.0'
```
