# Add Intelligence Rule — proceso actualizado

Las reglas ya no viven en intelligence.js.
Viven en el prompt del agente en la plataforma Toqan.

Para agregar una regla nueva:
1. Confirmar que las señales que cruza están en collector.js
2. Confirmar que esos campos están en el JSON que envía toqan.js
3. Abrir el agente en Toqan y agregar la regla al prompt
   siguiendo el formato RULE_XXX_NN que ya existe
4. Probar con el JSON de test en src/data/dummy_session.js
5. Documentar en docs/DECISIONS.md con fecha y señales que cruza
