## Overview

This Wiki page discusses locale-sensitive formatting and parsing issues that developers may encounter when running their applications on JDK 20+.

Specifically, this document provides background information on changes in the JDK as well as guidance on how to address formatting and parsing issues encountered in Spring applications.

Before you read any further, we highly recommend that you first read [JEP 252: Use CLDR Locale Data by Default](https://openjdk.org/jeps/252) and [JEP 400: UTF-8 by Default](https://openjdk.org/jeps/400).

Although this document primarily focuses on issues related to time formats for the US English locale (for example, `3:30 PM`), numerous other use cases may potentially be affected by locale-sensitive formats for dates, times, currencies, time zones, etc. provided by the [Unicode Common Locale Data Repository (CLDR) project](https://cldr.unicode.org/).

## Background

JDK 20 adopted Unicode [CLDR 42](https://cldr.unicode.org/downloads/cldr-42) which introduced changes to locale data that can adversely affect software applications. For example, [CLDR-14032](https://unicode-org.atlassian.net/browse/CLDR-14032) changed the space character that precedes the `period` (AM or PM) in formatted date/time text from a standard space (`" "`) to a narrow non-breaking space (NNBSP: `"\u202F"`).

**Consequently, applications that rely on date/time parsing and formatting may encounter incompatible changes in behavior when running on JDK 20 or higher – for example, web applications that make use of Spring Framework's `@DateTimeFormat` support.**

On JDK 20, 21, and 22, applications can use the `-Djava.locale.providers=COMPAT` command-line argument for the `java` executable in order to force the use of legacy locale data which uses a standard space for the space character that precedes the `period` in formatted date/time text.

Note, however, that the aforementioned `COMPAT` mode has been removed in JDK 23.

**It is also worth pointing out that string representations of date/time formats can no longer be reliably encoded with ISO-8859-1 (latin-1) encoding.** The reason is that characters such as a narrow non-breaking space (`"\u202F"`) can only be properly represented with UTF encoding. For example, if you have a web application that generates HTML web pages using ISO-8859-1 encoding and containing time values formatted using the US English locale (for example, `3:30 PM`), beginning with JDK 20 the formatted times will contain a `?` instead of a narrow non-breaking space before AM or PM (such as `3:30?PM`).

**In summary, developers and frameworks must find a way to either avoid or deal with locale-sensitive formats provided by both current and future versions of the Unicode CLDR.**

## Recommendations

The Spring team recommends the use of ISO standardized formats for both parsing and formatting of date/time values whenever possible. For example, consider using a predefined `iso` pattern in Spring's `@DateTimeFormat` annotation (for example, `@DateTimeFormat(iso = ISO.DATE_TIME)`) or one of the `ISO_*` constants defined in `java.time.format.DateTimeFormatter` (such as `ISO_DATE_TIME`) for programmatic handling of JSR-310 `java.time` value types.

Another option is to always use date/time formatting patterns that you control. In other words, instead of relying on predefined locale-sensitive patterns such as `@DateTimeFormat(style = "-M")` or `java.time.format.FormatStyle.MEDIUM` to parse or format a time, define your own date/time pattern that parses and formats times the way you expect – for example, `"HH:mm a"` to handle US English times such as `3:30 PM`, with a standard space before the `AM` or `PM`.

**Using an ISO standardized format or a concrete pattern that you control allows for reliable system-independent and locale-independent parsing and formatting of date/time values.** However, if that is not an option for your use case, consider one of the _lenient_ approaches outlined below.

**The Spring team also recommends the use of UTF encoding whenever possible – for example, `UTF-8`.**

## Options for Application Code and Tests

Within application code or tests you may need to match against an input string to determine if the provided text adheres to the format you expect; however, beginning with JDK 20 the input string may contain a narrow non-breaking space where you have traditionally expected a standard space. To address use cases like that, you can use the `\p{Zs}` regular expression pattern to match against any Unicode space character. For example, `12:00\\p{Zs}PM` matches against `"12:00<SPACE>PM"` and `"12:00<NNBSP>PM"`, where `<SPACE>` is a standard space and `<NNBSP>` is a narrow non-breaking space (`"\u202F"`).

If you are using [JUnit Jupiter](https://junit.org/junit5/docs/current/user-guide/#writing-tests-conditional-execution-jre) as your testing framework and wish to run certain tests on JDK versions before or after the CLDR changes in the JDK, you can annotate a test class or test method as follows.

- `@EnabledForJreRange(max = JAVA_19)`: enabled on all JDKs before JDK 20.
- `@EnabledForJreRange(min = JAVA_20)`: enabled on all JDKs after and including JDK 20.

The following sections provide guidance on lenient parsing for `@DateTimeFormat`, `SimpleDateFormat`, and `DateTimeFormatter`. Note, however, that you can also consider implementing and registering a custom `java.util.spi.LocaleServiceProvider` to support more advanced use cases. See [JEP 252](https://openjdk.org/jeps/252) for an example.

#### `@DateTimeFormat` Configuration

As mentioned previously in this document, the Spring team recommends the use of ISO standardized formats or concrete patterns for both parsing and formatting of date/time values whenever possible. For time values, this can be achieved via `@DateTimeFormat(iso = ISO.TIME)` (which uses the `HH:mm:ss.SSSXXX` pattern) or `@DateTimeFormat(pattern = "h:mm a")` (which uses the `h:mm a` pattern that is compatible with `java.text.DateFormat.SHORT` and Spring's `-S` style for parsing and formatting time values, prior to the changes introduced in CLDR 42).

To make your application more robust to changes in the CLDR or simply to support multiple parsing patterns simultaneously, you can configure custom `fallbackPatterns` in `@DateTimeFormat`. Please note, however, that fallback patterns are only used for parsing. They are not used for printing the value as a string. The _primary_ `pattern`, `iso`, or `style` attribute is always used for printing.

For example, if you wish to use the ISO time format for printing and as the primary parsing pattern but allow for lenient parsing of input for alternative time formats, you could configure something similar to the following.

```java
@DateTimeFormat(iso = ISO.TIME, fallbackPatterns = {"HH:mm:ss a", "HH:mm:ss\u202Fa"})
```

If you wish to achieve something similar for date/time formats, you could configure `@DateTimeFormat` as follows.

```java
@DateTimeFormat(iso = ISO.DATE_TIME, fallbackPatterns = {"MM/dd/yy HH:mm:ss a", "MM/dd/yy HH:mm:ss\u202Fa"})
```

If you wish to use a US English locale based time format – with a standard space before `AM` or `PM` – for printing and as the primary parsing pattern but allow for lenient parsing of input that contains a narrow non-breaking space before `AM` or `PM`, you could configure something similar to the following.

```java
@DateTimeFormat(pattern = "HH:mm:ss a", fallbackPatterns = "HH:mm:ss\u202Fa")
```

Although not generally recommended, if you need to print times using the locale-sensitive pattern in the current version of the CLDR (which may vary depending on the Java runtime environment) but allow for lenient parsing of input for alternative time formats, you could configure something similar to the following.

```java
@DateTimeFormat(style = "-M", fallbackPatterns = {"HH:mm:ss a", "HH:mm:ss\u202Fa"})
```

#### Lenient `SimpleDateFormat` and `DateTimeFormatter` Configuration

In JDK 23, the Java team introduced support for lenient parsing of space characters in `java.text.SimpleDateFormat` as well as `java.time.format.DateTimeFormatter`.

`SimpleDateFormat` is lenient by default; however, `DateTimeFormatter` instances are not lenient by default, and factory methods like `DateTimeFormatter.ofLocalizedTime(...)` do not create lenient formatters.

To create a lenient `DateTimeFormatter`, one must forgo the use of the static factory methods in `DateTimeFormatter` and instead make use of the `DateTimeFormatterBuilder`. The following example shows how to create a static factory method for a lenient `DateTimeFormatter` that is comparable to what `DateTimeFormatter.ofLocalizedDateTime(FormatStyle, FormatStyle)` produces.

```java
pubic static DateTimeFormatter createLenientDateTimeFormatter(
         FormatStyle dateStyle, FormatStyle timeStyle) {

   return new DateTimeFormatterBuilder()
         .parseLenient()
         .appendLocalized(dateStyle, timeStyle)
         .toFormatter()
         .withChronology(IsoChronology.INSTANCE);
}
```

Please note, however, that lenient parsing in `DateTimeFormatter` instances and especially in `SimpleDateFormat` may be more _lenient_ that you need or desire. For example, you may find that parsing succeeds for input which is technically invalid, such as `Feb 29` for a non-leap-year. In light of that, be cautious when configuring lenient parsing for `SimpleDateFormat` and `DateTimeFormatter`, and be sure to verify that your application continues to work properly.

## Resources

- https://openjdk.org/jeps/252
- https://cldr.unicode.org/downloads/cldr-42
- https://unicode-org.atlassian.net/browse/CLDR-14032
- https://bugs.openjdk.org/browse/JDK-8223587
- https://bugs.openjdk.org/browse/JDK-8284840
- https://bugs.openjdk.org/browse/JDK-8297316
- https://bugs.openjdk.org/browse/JDK-8304925
- https://bugs.openjdk.org/browse/JDK-8324665

## Related Spring Issues

- https://github.com/spring-projects/spring-framework/issues/30185
- https://github.com/spring-projects/spring-framework/issues/33144
- https://github.com/spring-projects/spring-framework/issues/30649
- https://github.com/spring-projects/spring-framework/issues/33151
- https://github.com/spring-projects/spring-boot/issues/42430
