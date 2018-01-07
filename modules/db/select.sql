DROP FUNCTION select_all;
CREATE OR REPLACE FUNCTION select_all(table_name varchar(63))
  RETURNS table(id UUID, data JSONB) AS
$func$
BEGIN
    RETURN QUERY EXECUTE format('SELECT * FROM %s', table_name);
END;
$func$ LANGUAGE plpgsql;

/* -+-+-+-+-+-+-+-+-+-+-+-+-+- */

DROP FUNCTION select_by_ids;
CREATE OR REPLACE FUNCTION select_by_ids(table_name varchar(63), ids varchar(36)[])
  RETURNS table(id UUID, data JSONB) AS
$func$
DECLARE
    qstr TEXT := format('SELECT * FROM %s', table_name);
    value text;
    index integer := 0;
    a_length integer := array_length(ids, 1);
BEGIN
    qstr := qstr || ' WHERE id in (';
    FOREACH value IN ARRAY ids LOOP
        qstr := qstr || quote_literal(value::uuid);
        index := index + 1;
        IF index < a_length THEN
            qstr := qstr || ', ';
        END IF;
    END LOOP;
    qstr := qstr || ')';
    RETURN QUERY EXECUTE qstr;
END;
$func$ LANGUAGE plpgsql;

/* -+-+-+-+-+-+-+-+-+-+-+-+-+- */

DROP FUNCTION select_by_array_values;
CREATE OR REPLACE FUNCTION select_by_array_values(table_name varchar(63), array_name text, array_values text[])
  RETURNS table(id UUID, data JSONB) AS
$func$
DECLARE
    qstr TEXT := format('SELECT * FROM %s', table_name);
    value text;
    index integer := 0;
    a_length integer := array_length(array_values, 1);
BEGIN
    qstr := qstr || ' WHERE data->''' || quote_ident(array_name) || ''' @> ANY (ARRAY [';
    FOREACH value IN ARRAY array_values LOOP
        qstr := qstr || quote_literal('["' || value || '"]');
        index := index + 1;
        IF index < a_length THEN
            qstr := qstr || ', ';
        END IF;
    END LOOP;
    qstr := qstr || ']::jsonb[])';
    RETURN QUERY EXECUTE qstr;
END;
$func$ LANGUAGE plpgsql;
