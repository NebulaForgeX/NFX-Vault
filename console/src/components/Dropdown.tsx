import { Flex, Select } from "@radix-ui/themes";

export type DropdownOption = { value: string; label: string };

export type DropdownProps = {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
};

export default function Dropdown({ options, value, onChange, placeholder, error, disabled }: DropdownProps) {
  return (
    <Flex direction="column" gap="1" width="100%">
      <Select.Root value={value || undefined} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger placeholder={placeholder} color={error ? "red" : undefined} />
        <Select.Content>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}
