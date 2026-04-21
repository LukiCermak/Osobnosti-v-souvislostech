export type Priority = "high" | "medium" | "low";

export interface Person {
  id: string;
  displayName: string;
  born?: number | null;
  died?: number | null;
  disciplines: string[];
  significance: string;
}

mkdir -p specialni-pedagogika-osobnosti-app/content/schemas

cat > specialni-pedagogika-osobnosti-app/content/schemas/person.schema.json << 'EOF'
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "displayName", "disciplines", "significance"],
  "properties": {
    "id": { "type": "string" },
    "displayName": { "type": "string" },
    "born": { "type": ["number", "null"] },
    "died": { "type": ["number", "null"] },
    "disciplines": { "type": "array", "items": { "type": "string" } },
    "significance": { "type": "string" }
  },
  "additionalProperties": false
}
