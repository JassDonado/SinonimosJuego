-- Script SQL para insertar el banco de preguntas en la tabla sinonimos
-- Ejecutar en la consola SQL de Supabase o en tu cliente PostgreSQL

INSERT INTO sinonimos (id, palabra, sinonimos, dificultad, categoria, "createdAt") VALUES
('uuid1', 'grande', '["enorme", "gigante", "amplio", "inmenso", "colosal", "extenso"]', 'facil', 'adjetivos', NOW()),
('uuid2', 'feliz', '["alegre", "contento", "satisfecho", "dichoso", "encantado", "jubiloso"]', 'facil', 'adjetivos', NOW()),
('uuid3', 'casa', '["hogar", "vivienda", "residencia", "domicilio", "morada"]', 'facil', 'sustantivos', NOW()),
('uuid4', 'comenzar', '["iniciar", "empezar", "arrancar", "principiar", "dar inicio"]', 'media', 'verbos', NOW()),
('uuid5', 'terminar', '["finalizar", "acabar", "concluir", "completar", "cerrar"]', 'media', 'verbos', NOW()),
('uuid6', 'rápido', '["veloz", "ligero", "ágil", "inmediato", "acelerado"]', 'facil', 'adjetivos', NOW()),
('uuid7', 'bonito', '["hermoso", "bello", "lindo", "atractivo", "precioso"]', 'facil', 'adjetivos', NOW()),
('uuid8', 'inteligente', '["listo", "sabio", "brillante", "astuto", "ingenioso"]', 'media', 'adjetivos', NOW()),
('uuid9', 'difícil', '["complicado", "duro", "arduo", "complejo", "desafiante"]', 'media', 'adjetivos', NOW()),
('uuid10', 'pequeño', '["chico", "diminuto", "reducido", "minúsculo", "corto"]', 'facil', 'adjetivos', NOW()),
('uuid11', 'hablar', '["conversar", "dialogar", "platicar", "comunicar", "expresar"]', 'media', 'verbos', NOW()),
('uuid12', 'mirar', '["observar", "ver", "contemplar", "examinar", "visualizar"]', 'media', 'verbos', NOW()),
('uuid13', 'trabajar', '["laborar", "emplearse", "ejercer", "desempeñar", "producir"]', 'media', 'verbos', NOW()),
('uuid14', 'pensar', '["reflexionar", "considerar", "meditar", "razonar", "analizar"]', 'media', 'verbos', NOW()),
('uuid15', 'ayudar', '["apoyar", "asistir", "socorrer", "colaborar", "auxiliar"]', 'facil', 'verbos', NOW()),
('uuid16', 'caminar', '["andar", "pasear", "transitar", "recorrer", "marchar"]', 'facil', 'verbos', NOW()),
('uuid17', 'comprar', '["adquirir", "obtener", "conseguir", "aprovisionarse"]', 'facil', 'verbos', NOW()),
('uuid18', 'enseñar', '["educar", "instruir", "explicar", "formar", "guiar", "mentorizar", "entrenar"]', 'media', 'verbos', NOW()),
('uuid19', 'aprender', '["estudiar", "asimilar", "comprender", "dominar", "captar", "adquirir conocimiento"]', 'media', 'verbos', NOW()),
('uuid20', 'fácil', '["sencillo", "simple", "accesible", "claro", "ligero"]', 'facil', 'adjetivos', NOW()),
('uuid21', 'bello', '["hermoso", "agraciado", "vistoso", "elegante", "radiante"]', 'dificil', 'adjetivos', NOW()),
('uuid22', 'tenacidad', '["perseverancia", "constancia", "determination", "persistencia"]', 'dificil', 'sustantivos', NOW()),
('uuid23', 'perspicacia', '["agudeza", "discernimiento", "penetración", "lucidez"]', 'dificil', 'sustantivos', NOW()),
('uuid24', 'elocuencia', '["locuacidad", "fluidez", "oratoria", "facundia"]', 'dificil', 'sustantivos', NOW()),
('uuid25', 'lúcido', '["claro", "transparente", "evidente", "preciso"]', 'dificil', 'adjetivos', NOW());

-- Actualizar los IDs a UUIDs válidos usando gen_random_uuid()
-- NOTA: Ejecuta esto después de insertar:
-- UPDATE sinonimos SET id = gen_random_uuid() WHERE id LIKE 'uuid%';
