
DO $$
DECLARE
  first_names text[] := ARRAY['James','John','Robert','Michael','David','William','Richard','Joseph','Thomas','Charles','Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Kenneth','Ashley','Emily','Amanda','Melissa','Rachel','Laura','Kevin','Brian','Jason','Ryan','Gary'];
  last_names text[] := ARRAY['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores'];
  domains text[] := ARRAY['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','proton.me'];
  r RECORD;
  fn text; ln text; new_name text; email text; phone text;
BEGIN
  FOR r IN SELECT id, seller, extras, country_code FROM public.products WHERE category = 'cards' LOOP
    fn := first_names[1 + floor(random() * array_length(first_names,1))::int];
    ln := last_names[1 + floor(random() * array_length(last_names,1))::int];
    new_name := fn || ' ' || ln;
    email := lower(fn) || '.' || lower(ln) || (10 + floor(random()*890))::int::text || '@' || domains[1 + floor(random()*array_length(domains,1))::int];
    phone := '+' || (1 + floor(random()*99))::int::text || ' ' || (1000000000 + floor(random()*8999999999))::bigint::text;

    IF r.seller IS NULL OR r.seller ~ '\*' THEN
      UPDATE public.products SET seller = new_name WHERE id = r.id;
    END IF;

    IF r.extras IS NULL OR r.extras = '' OR r.extras !~* 'EMAIL' THEN
      UPDATE public.products SET extras = 'EMAIL: ' || email || ' | PHONE: ' || phone WHERE id = r.id;
    END IF;
  END LOOP;
END $$;
