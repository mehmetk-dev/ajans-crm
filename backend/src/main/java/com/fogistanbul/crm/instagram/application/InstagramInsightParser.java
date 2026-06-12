package com.fogistanbul.crm.instagram.application;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.OptionalLong;

@Component
public class InstagramInsightParser {

    public List<Map<String, Object>> dataRows(Map<String, Object> response) {
        return mapList(response.get("data"));
    }

    public List<Map<String, Object>> insightValues(Map<String, Object> response) {
        List<Map<String, Object>> data = dataRows(response);
        if (data.isEmpty()) {
            return List.of();
        }
        return mapList(data.get(0).get("values"));
    }

    public List<Map<String, Object>> totalInsightValues(Map<String, Object> response) {
        List<Map<String, Object>> data = dataRows(response);
        if (data.isEmpty()) {
            return List.of();
        }

        Object totalValue = data.get(0).get("total_value");
        if (totalValue instanceof Map<?, ?> totalMap) {
            Object value = totalMap.get("value");
            return List.of(Map.of("value", value != null ? value : 0));
        }
        return mapList(data.get(0).get("values"));
    }

    public OptionalLong singleInsightValue(Map<String, Object> response, String metric) {
        for (Map<String, Object> insight : dataRows(response)) {
            Object name = insight.get("name");
            if (name == null || metric.equalsIgnoreCase(name.toString())) {
                return OptionalLong.of(extractInsightValue(insight));
            }
        }
        return OptionalLong.empty();
    }

    public long sumInsightValues(List<Map<String, Object>> values) {
        return values.stream().mapToLong(value -> toLong(value.get("value"))).sum();
    }

    public FollowStats followStats(Map<String, Object> response) {
        long[] counts = new long[2];
        boolean[] found = new boolean[1];
        collectFollowStats(response, "", counts, found);
        return new FollowStats(counts[0], counts[1], found[0]);
    }

    public long toLong(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }

    private long extractInsightValue(Object insight) {
        if (insight instanceof Map<?, ?> map) {
            if (map.get("total_value") != null) {
                return extractInsightValue(map.get("total_value"));
            }
            if (map.get("values") != null) {
                return extractInsightValue(map.get("values"));
            }
            if (map.get("value") != null) {
                return extractInsightValue(map.get("value"));
            }
            return 0;
        }
        if (insight instanceof List<?> list) {
            return list.isEmpty() ? 0 : extractInsightValue(list.get(list.size() - 1));
        }
        return toLong(insight);
    }

    private void collectFollowStats(Object node, String label, long[] counts, boolean[] found) {
        if (node instanceof Map<?, ?> map) {
            Object value = map.get("value");
            Object followType = map.get("follow_type");
            if (followType != null && value != null) {
                addFollowStat(followType.toString(), value, counts, found);
            }

            Object dimensionValues = map.get("dimension_values");
            if (dimensionValues instanceof List<?> dimensions && value != null) {
                String dimensionLabel = String.join(
                        " ", dimensions.stream().map(String::valueOf).toList());
                addFollowStat(dimensionLabel, value, counts, found);
            }

            map.forEach((key, valueNode) ->
                    collectFollowStats(valueNode, String.valueOf(key), counts, found));
        } else if (node instanceof List<?> list) {
            list.forEach(item -> collectFollowStats(item, label, counts, found));
        } else if (node instanceof Number || node instanceof String) {
            addFollowStat(label, node, counts, found);
        }
    }

    private void addFollowStat(
            String label,
            Object value,
            long[] counts,
            boolean[] found) {
        if (label == null || value == null) {
            return;
        }
        String normalized = label.toLowerCase(Locale.ROOT)
                .replace("-", "_")
                .replace(" ", "_");
        if (normalized.contains("follows_and_unfollows")) {
            return;
        }

        boolean lost = normalized.contains("unfollow")
                || normalized.contains("nonfollower")
                || normalized.contains("non_follower")
                || normalized.contains("lost");
        boolean gained = normalized.equals("follow")
                || normalized.equals("follows")
                || normalized.equals("follower")
                || normalized.equals("followers")
                || normalized.contains("new_follow")
                || (normalized.contains("follower") && !lost);
        if (!gained && !lost) {
            return;
        }

        if (lost) {
            counts[1] += toLong(value);
        } else {
            counts[0] += toLong(value);
        }
        found[0] = true;
    }

    private List<Map<String, Object>> mapList(Object value) {
        if (!(value instanceof List<?> values)) {
            return List.of();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object item : values) {
            if (item instanceof Map<?, ?> map) {
                Map<String, Object> row = new LinkedHashMap<>();
                map.forEach((key, cell) -> row.put(String.valueOf(key), cell));
                rows.add(row);
            }
        }
        return rows;
    }

    public record FollowStats(long gained, long lost, boolean available) {
        public static FollowStats unavailable() {
            return new FollowStats(0, 0, false);
        }
    }
}
