_This document describes how to build the Spring Framework from the command line
and how to import the Spring Framework projects into an IDE. You may also be
interested to see [[Code Style]] and [[IntelliJ IDEA Editor Settings]]._

The Spring Framework uses a [Gradle](https://gradle.org) build. The instructions below
use the [Gradle Wrapper](https://vimeo.com/34436402) from the root of the source tree.
The wrapper script serves as a cross-platform, self-contained bootstrap mechanism
for the build system.

### Before You Start

To build you will need [Git](https://docs.github.com/en/get-started/quickstart/set-up-git) and
[JDK 17](https://adoptium.net/) and [JDK 21](https://jdk.java.net/21/) in a [location detected by Gradle toolchain support](https://docs.gradle.org/current/userguide/toolchains.html#sec:auto_detection). Be sure
that your `JAVA_HOME` environment variable points to the `jdk17` folder extracted
from the JDK download. You can check which Java installations are detected by gradle by running `./gradlew -q javaToolchains` in the project root. If your local installation is not detected, you can declare it in your `$HOME/.gradle/gradle.properties` file by adding the following property: `org.gradle.java.installations.paths=/path/to/java21/,/path/to/other/java/install/` ([see Gradle documentation](https://docs.gradle.org/current/userguide/toolchains.html#sec:custom_loc)).

For users of SDKMAN, Spring Framework provides `.sdkmanrc` files that set up JDK 17 correctly.
Simply use `sdk env` to do so.
This command is also available in the 5.3 branch, which uses JDK 8.


### Get the Source Code

```shell
git clone git@github.com:spring-projects/spring-framework.git
cd spring-framework
```

### Build from the Command Line

To compile, test, and build all jars, distribution zips, and docs use:

```shell
./gradlew build
```

The first time you run the build it may take a while to download Gradle and all build dependencies, as well as to run all tests. Once you've bootstrapped a Gradle distribution and downloaded dependencies, those are cached in your `$HOME/.gradle` directory.

Gradle has good incremental build support, so run without `clean` to keep things snappy. You can also use the `-a` flag and the `:<project>` prefix to avoid evaluating and building other modules. For example, if iterating over changes in `spring-webmvc`, run with the following to evaluate and build only that module:

```shell
./gradlew -a :spring-webmvc:test
```


### Install in local Maven repository

If you need to publish Spring Framework artifacts locally for testing, you can do the following:

```shell
./gradlew pTML -PskipDocs
```

`pTML` is an abbreviation for the `publishToMavenLocal` task. The `skipDocs` property will skip the "documentation" and "distribution" tasks (typically, the javadoc, kdoc and zip artifacts for docs in general). This can be useful for local iterations, but it is advised to run the full build before submitting a Pull Request.

To install all Spring Framework jars in your local Maven repository, use the following.

```shell
./gradlew publishToMavenLocal
```


### Import into your IDE

Ensure JDK 17 is configured properly in the IDE.
Follow the instructions for [Eclipse](https://github.com/spring-projects/spring-framework/blob/master/import-into-eclipse.md) and [IntelliJ IDEA](https://github.com/spring-projects/spring-framework/blob/master/import-into-idea.md).
