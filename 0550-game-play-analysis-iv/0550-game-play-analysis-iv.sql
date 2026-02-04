# Write your MySQL query statement below
WITH FirstLogin AS (
    SELECT 
        player_id,
        MIN(event_date) AS first_login_date
    FROM 
        Activity
    GROUP BY 
        player_id
),
NextDayLogin AS (
    SELECT 
        f.player_id,
        f.first_login_date,
        a.event_date
    FROM 
        FirstLogin f
    JOIN 
        Activity a ON f.player_id = a.player_id 
    WHERE 
        a.event_date = DATE_ADD(f.first_login_date, INTERVAL 1 DAY)
)
SELECT 
    ROUND(COUNT(DISTINCT NextDayLogin.player_id) / COUNT(DISTINCT FirstLogin.player_id), 2) AS fraction
FROM 
    FirstLogin
LEFT JOIN 
    NextDayLogin ON FirstLogin.player_id = NextDayLogin.player_id;
