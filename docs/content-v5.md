# v5 content reader

The reader uses `/v5/` exclusively. Each service format contains ordered references with `contentId`, required English `name`, and optional Arabic `nameAr`. The referenced library record supplies only the payload and its type, never its visible variation title. Blank Arabic placement titles fall back to the English placement title.

Deploy the v5 data and publisher before merging this change into develop. Validate PPE, then raise a separate develop-to-master production promotion. Existing v3/v4 AWS content must remain unchanged. Dataset regression tests can be run with HAZZAT_V5_DATASET pointing at a staging root containing v5/ and HAZZAT_V4_DATASET pointing at the verified backup source root containing v4/.
