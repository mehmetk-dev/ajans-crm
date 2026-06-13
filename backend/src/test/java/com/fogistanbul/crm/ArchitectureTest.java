package com.fogistanbul.crm;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.library.freeze.FreezingArchRule;
import org.springframework.web.bind.annotation.RestController;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(
        packages = "com.fogistanbul.crm",
        importOptions = ImportOption.DoNotIncludeTests.class
)
class ArchitectureTest {

    @ArchTest
    static final ArchRule controllers_do_not_access_repositories = FreezingArchRule.freeze(
            noClasses()
                    .that().areAnnotatedWith(RestController.class)
                    .should().dependOnClassesThat().resideInAPackage("..repository..")
                    .because("controllers must delegate persistence access to application services")
    );
}
