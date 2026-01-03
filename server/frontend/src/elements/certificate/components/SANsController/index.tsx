import type { ApplyCertificateFormValues } from "../../controllers/applyCertificateSchema";

import { memo, useState, useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { X } from "@/assets/icons/lucide";

import styles from "./styles.module.css";

interface SANsControllerProps {
  disabled?: boolean;
  readOnly?: boolean;
}

const SANsController = memo(({ disabled = false, readOnly = false }: SANsControllerProps) => {
  const { t } = useTranslation("certificateElements");
  const { control, watch } = useFormContext<ApplyCertificateFormValues>();
  const formValue = watch("sans");
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState<string[]>(() => formValue || []);

  // 同步表单值到本地状态（当外部改变时，如重置表单）
  useEffect(() => {
    if (formValue) {
      setItems(formValue);
    } else {
      setItems([]);
    }
  }, [formValue]);

  const handleAddItem = (value: string, currentItems: string[]): string[] => {
    const trimmedValue = value.trim();
    if (trimmedValue && !currentItems.includes(trimmedValue)) {
      return [...currentItems, trimmedValue];
    }
    return currentItems;
  };

  const handleRemoveItem = (index: number, currentItems: string[]): string[] => {
    return currentItems.filter((_, i) => i !== index);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue) {
        const newItems = handleAddItem(trimmedValue, items);
        setItems(newItems);
        field.onChange(newItems);
        setInputValue("");
        inputRef.current?.focus();
      }
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{t("form.sans")}</h3>
      <Controller
        name="sans"
        control={control}
        render={({ field }) => (
          <div className={styles.container}>
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  if (!readOnly && !disabled) {
                    setInputValue(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (!readOnly && !disabled) {
                    handleInputKeyDown(e, field);
                  }
                }}
                placeholder={t("form.sansPlaceholder")?.split("\n")[0] || "输入域名后按回车添加"}
                className={styles.input}
                disabled={disabled || readOnly}
              />
            </div>
            <div className={styles.itemsWrapper}>
              {items.length > 0 ? (
                <div className={styles.itemsList}>
                  {items.map((item, index) => (
                    <div key={index} className={styles.item}>
                      <span className={styles.itemText}>{item}</span>
                      {!readOnly && !disabled && (
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => {
                            const newItems = handleRemoveItem(index, items);
                            setItems(newItems);
                            field.onChange(newItems);
                          }}
                          title="删除"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  {readOnly ? t("form.sansReadOnly") : t("form.sansHelp")}
                </div>
              )}
            </div>
          </div>
        )}
      />
      <p className={styles.helpText}>
        {readOnly ? t("form.sansReadOnly") : t("form.sansHelp")}
      </p>
    </div>
  );
});

SANsController.displayName = "SANsController";

export default SANsController;

