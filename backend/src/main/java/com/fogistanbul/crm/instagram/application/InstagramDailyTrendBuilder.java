package com.fogistanbul.crm.instagram.application;

import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.DailyRow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class InstagramDailyTrendBuilder {

    private final InstagramInsightParser parser;

    public List<DailyRow> build(
            List<Map<String, Object>> followerValues,
            List<Map<String, Object>> reachValues,
            Map<String, Long> dailyViews) {
        List<DailyRow> rows = new ArrayList<>();
        for (int index = 0; index < followerValues.size(); index++) {
            Map<String, Object> follower = followerValues.get(index);
            String date = extractDate(follower);
            long reach = index < reachValues.size()
                    ? parser.toLong(reachValues.get(index).get("value"))
                    : 0;
            rows.add(new DailyRow(
                    date,
                    parser.toLong(follower.get("value")),
                    dailyViews.getOrDefault(date, 0L),
                    reach));
        }
        return rows;
    }

    private String extractDate(Map<String, Object> row) {
        Object endTime = row.get("end_time");
        if (endTime == null) {
            return "";
        }
        String value = endTime.toString();
        return value.length() >= 10 ? value.substring(0, 10) : value;
    }
}
