/*
  # Create books_by_month function

  1. Function
    - `get_books_by_month()` - Returns books grouped by month
      - Returns array of objects with `month` (YYYY-MM) and `count`
      - Orders by month in descending order
      - Limits to last 12 months
*/

CREATE OR REPLACE FUNCTION get_books_by_month()
RETURNS TABLE (month text, count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    to_char(created_at, 'YYYY-MM') as month,
    COUNT(*) as count
  FROM books
  GROUP BY to_char(created_at, 'YYYY-MM')
  ORDER BY month DESC
  LIMIT 12;
$$;
