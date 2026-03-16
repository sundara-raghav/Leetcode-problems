WITH ConfirmedRequests AS (
  SELECT
    user_id,
    COUNT(CASE WHEN action = 'confirmed' THEN 1 END) AS confirmed_requests
  FROM Confirmations
  GROUP BY user_id
),
AllRequests AS (
  SELECT
    user_id,
    COUNT(*) AS total_requests
  FROM Confirmations
  GROUP BY user_id
)

SELECT
  u.user_id,
  COALESCE(ROUND(cr.confirmed_requests / ar.total_requests, 2), 0) AS confirmation_rate
FROM Signups u
LEFT JOIN ConfirmedRequests cr ON u.user_id = cr.user_id
LEFT JOIN AllRequests ar ON u.user_id = ar.user_id;