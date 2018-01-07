CREATE TABLE IF NOT EXISTS {{table}} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB
);

-- INSERTING
PREPARE {{table}}_insert(jsonb) AS
  INSERT INTO {{table}}(data) VALUES($1) RETURNING ID;

-- SELECTING
PREPARE {{table}}_select_by_ids(UUID[]) AS
  SELECT * FROM {{table}} WHERE id = ANY ($1);

{% for arr in arrays %}
PREPARE {{table}}_select_by_{{arr}}(text[]) AS
  SELECT * FROM {{table}} WHERE data->'{{arr}}' @> ANY (sort_values($1));
{% endfor %}

{% for prop in props %}
PREPARE {{table}}_select_by_{{prop}}(text) AS
  SELECT * FROM {{table}} WHERE data->>'{{prop}}' = $1;
{% endfor %}

CREATE OR REPLACE FUNCTION sort_values(arr_values text[])
  RETURNS jsonb[] AS
$func$
DECLARE
  result_arr jsonb[];
  value text;
BEGIN
  FOREACH value IN ARRAY arr_values LOOP
    result_arr := array_append(result_arr, ('["' || value || '"]')::jsonb);
  END LOOP;
  RETURN result_arr;
END;
$func$ LANGUAGE plpgsql;

-- UPDATING
PREPARE {{table}}_update_by_id(jsonb, UUID) AS
  UPDATE {{table}} SET data = $1 WHERE id = $2;

-- DELETING
PREPARE {{table}}_delete_by_ids(UUID[]) AS
  DELETE FROM {{table}} WHERE id = ANY ($1);
