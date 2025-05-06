# 基础

## SpringBoot运行原理

当`@ComponentScan`没有配置`basepackage`默认情况下，springboot会扫描`@SpringBootApplication`注解所在类的所在包以及子包，并启动springboot应用。