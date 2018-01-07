async select(what, from, where) {
  var qstr = 'SELECT '+what+' FROM '+from

  var rows;
  if (where) {
    qstr += ' WHERE ';

    var values = [];
    var ci = 1;
    for (var key in where) {
      if (Array.isArray(where[key])) {
        qstr += "data->'"+key+"' @> ANY (ARRAY [";
        for (var i = 0; i < where[key].length; i++) {
          if (i > 0) qstr += ", ";
          qstr += "'["+'"'+where[key][i]+'"'+"]'";
        }
        qstr += "]::jsonb[])";
      } else {
        qstr += key+" = $"+ci;
        values.push(where[key]);
        ci++;
      }
    }

    const query = {
      text: qstr,
      values: values
    }
    var result = await this.client.query(query).catch(e => console.error(e.stack));
    rows  = result.rows;
  } else {
    var result = await this.client.query(qstr).catch(e => console.error(e.stack));
    rows  = result.rows;
  }
//  console.log(qstr);
  return rows;
}
