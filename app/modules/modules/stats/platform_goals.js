const PLATFORM_GOALS = {
    "CAFFEINE": {
        "CAFFEINE_CASTER_PROGRAM": {
            "name": "Caffeine Caster Program",
            "link": "https://caffeine.custhelp.com/app/answers/detail/a_id/58/~/caffeine-caster-program",
            "is_permanent": true,
            "requirements": [
                {
                    "timeline": "MONTHLY",
                    "name": "Broadcast at least 10 hours",
                    "item": "BROADCASTED_HOURS",
                    "requirement": 10,
                    "compare": "GREATER_THAN_OR_EQUAL"
                },
                {
                    "timeline": "MONTHLY",
                    "name": "Broadcast on at least 8 different days",
                    "item": "BROADCASTED_DAYS",
                    "requirement": 8,
                    "compare": "GREATER_THAN_OR_EQUAL"
                },
                {
                    "timeline": "MONTHLY",
                    "name": "Have an average of at least 5 viewers across all broadcasts",
                    "item": "AVERAGE_VIEWER_COUNT",
                    "requirement": 5,
                    "compare": "GREATER_THAN_OR_EQUAL"
                },
                {
                    "timeline": "NONE",
                    "name": "Have at least 100 followers",
                    "item": "FOLLOWER_COUNT",
                    "requirement": 100,
                    "compare": "GREATER_THAN_OR_EQUAL"
                }
            ]
        },
        "CAFFEINE_CYAN_PROGRAM_COL_1": {
            "name": "Caffeine Cyan Program (Column 1)",
            "link": "https://caffeine.custhelp.com/app/answers/detail/a_id/72/~/caffeine-partner-program",
            "is_permanent": false,
            "requirements": [
                {
                    "timeline": "QUARTERLY",
                    "name": "Broadcast at least 120 hours every quarter",
                    "item": "BROADCASTED_HOURS",
                    "requirement": 120,
                    "compare": "GREATER_THAN_OR_EQUAL"
                },
                {
                    "timeline": "QUARTERLY",
                    "name": "Have a CCV of at least 15 viewers across your top 5 broadcasts",
                    "item": "CCV_VIEWER_COUNT",
                    "requirement": 15,
                    "compare": "GREATER_THAN_OR_EQUAL"
                },
                {
                    "timeline": "NONE",
                    "name": "Have at least 100 followers",
                    "item": "FOLLOWER_COUNT",
                    "requirement": 100,
                    "compare": "GREATER_THAN_OR_EQUAL"
                }
            ]
        },
        "CAFFEINE_CYAN_PROGRAM_COL_2": {
            "name": "Caffeine Cyan Program (Column 2)",
            "link": "https://caffeine.custhelp.com/app/answers/detail/a_id/72/~/caffeine-partner-program",
            "is_permanent": false,
            "requirements": [
                {
                    "timeline": "QUARTERLY",
                    "name": "Broadcast at least 60 hours every quarter",
                    "item": "BROADCASTED_HOURS",
                    "requirement": 60,
                    "compare": "GREATER_THAN_OR_EQUAL"
                },
                {
                    "timeline": "QUARTERLY",
                    "name": "Have a CCV of at least 50 viewers across your top 5 broadcasts",
                    "item": "CCV_VIEWER_COUNT",
                    "requirement": 50,
                    "compare": "GREATER_THAN_OR_EQUAL"
                },
                {
                    "timeline": "NONE",
                    "name": "Have at least 100 followers",
                    "item": "FOLLOWER_COUNT",
                    "requirement": 100,
                    "compare": "GREATER_THAN_OR_EQUAL"
                }
            ]
        }
    }
}