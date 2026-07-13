package com.fogistanbul.crm.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import static org.assertj.core.api.Assertions.assertThat;

class AsyncConfigTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(AsyncConfig.class);

    @Test
    void exposesBoundedDefaultTaskExecutor() {
        contextRunner.run(context -> {
            TaskExecutor executor = context.getBean("taskExecutor", TaskExecutor.class);

            assertThat(executor).isInstanceOf(ThreadPoolTaskExecutor.class);
            ThreadPoolTaskExecutor pool = (ThreadPoolTaskExecutor) executor;
            assertThat(pool.getCorePoolSize()).isEqualTo(4);
            assertThat(pool.getMaxPoolSize()).isEqualTo(16);
        });
    }
}
