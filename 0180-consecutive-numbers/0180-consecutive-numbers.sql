# Write your MySQL query statement below
SELECT DISTINCT num AS ConsecutiveNums
FROM (
    SELECT num,
           LAG(num) OVER (ORDER BY id) AS prev_num,
           LAG(num, 2) OVER (ORDER BY id) AS prev_prev_num
    FROM Logs
) AS temp
WHERE num = prev_num AND num = prev_prev_num;
