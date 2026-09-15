import { Button, Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { Plus, Trash2 } from "lucide-react";

export type KeyValuePair = { key: string; value: string };

export type KeyValueEditorProps = {
  label?: string;
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  valueType?: "string" | "array";
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  error?: string;
};

export default function KeyValueEditor({
  label,
  pairs,
  onChange,
  keyPlaceholder = "key",
  valuePlaceholder = "value",
  error,
}: KeyValueEditorProps) {
  return (
    <Flex direction="column" gap="2">
      {label ? (
        <Text size="2" weight="medium">
          {label}
        </Text>
      ) : null}
      {pairs.map((pair, index) => (
        <Flex key={index} gap="2" align="center">
          <TextField.Root
            placeholder={keyPlaceholder}
            value={pair.key}
            onChange={(event) => {
              const next = [...pairs];
              next[index] = { ...pair, key: event.target.value };
              onChange(next);
            }}
          />
          <TextField.Root
            placeholder={valuePlaceholder}
            value={pair.value}
            onChange={(event) => {
              const next = [...pairs];
              next[index] = { ...pair, value: event.target.value };
              onChange(next);
            }}
          />
          <IconButton
            type="button"
            variant="ghost"
            color="red"
            onClick={() => onChange(pairs.filter((_, i) => i !== index))}
          >
            <Trash2 size={16} />
          </IconButton>
        </Flex>
      ))}
      <Button
        type="button"
        variant="soft"
        onClick={() => onChange([...pairs, { key: "", value: "" }])}
      >
        <Plus size={16} />
      </Button>
      {error ? (
        <Text size="1" color="red">
          {error}
        </Text>
      ) : null}
    </Flex>
  );
}
