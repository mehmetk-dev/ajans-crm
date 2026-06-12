package com.fogistanbul.crm.instagram.application;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class InstagramInsightParserTest {

    ObjectMapper objectMapper;
    InstagramInsightParser parser;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        parser = new InstagramInsightParser();
    }

    @Test
    void totalInsightValues_readsTotalValueShape() throws Exception {
        List<Map<String, Object>> values = parser.totalInsightValues(
                fixture("total-value.json"));

        assertThat(values).containsExactly(Map.of("value", 1842));
        assertThat(parser.sumInsightValues(values)).isEqualTo(1842);
    }

    @Test
    void insightValues_readsDailyRowsAndNumericStrings() throws Exception {
        List<Map<String, Object>> values = parser.insightValues(
                fixture("daily-values.json"));

        assertThat(values).hasSize(2);
        assertThat(parser.sumInsightValues(values)).isEqualTo(365);
    }

    @Test
    void singleInsightValue_usesLatestValueWhenValuesAreNested() throws Exception {
        var value = parser.singleInsightValue(
                fixture("daily-values.json"), "reach");

        assertThat(value).isPresent();
        assertThat(value.getAsLong()).isEqualTo(245);
    }

    @Test
    void followStats_readsBreakdownDimensionValues() throws Exception {
        var result = parser.followStats(
                fixture("follows-and-unfollows.json"));

        assertThat(result.available()).isTrue();
        assertThat(result.gained()).isEqualTo(37);
        assertThat(result.lost()).isEqualTo(9);
    }

    @Test
    void malformedShapesReturnEmptyOrZeroValues() {
        assertThat(parser.dataRows(Map.of("data", "invalid"))).isEmpty();
        assertThat(parser.singleInsightValue(Map.of(), "views")).isEmpty();
        assertThat(parser.toLong("invalid")).isZero();
    }

    private Map<String, Object> fixture(String fileName) throws Exception {
        try (InputStream input = getClass().getResourceAsStream(
                "/fixtures/instagram/" + fileName)) {
            return objectMapper.readValue(
                    input, new TypeReference<Map<String, Object>>() {});
        }
    }
}
