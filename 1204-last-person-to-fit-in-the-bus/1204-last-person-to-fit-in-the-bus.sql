# Write your MySQL query statement below
WITH OrderedQueue AS (
    SELECT person_id, person_name, weight, turn,
           SUM(weight) OVER (ORDER BY turn) AS cumulative_weight
    FROM Queue
)
SELECT person_name
FROM OrderedQueue
WHERE cumulative_weight <= 1000
ORDER BY turn DESC
LIMIT 1;
