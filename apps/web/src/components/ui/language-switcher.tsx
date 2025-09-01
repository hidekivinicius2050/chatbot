"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe, Check, ChevronsUpDown } from "lucide-react"
import { useI18n } from "@/hooks/use-i18n"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

const languages = [
  {
    value: "pt-BR",
    label: "Português",
    flag: "🇧🇷",
    native: "Português"
  },
  {
    value: "en-US",
    label: "English",
    flag: "🇺🇸",
    native: "English"
  }
]

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const { locale, changeLocale, getNativeLocaleName } = useI18n()

  const selectedLanguage = languages.find((lang) => lang.value === locale)

  const handleLanguageChange = (newLocale: string) => {
    changeLocale(newLocale as "pt-BR" | "en-US")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar idioma"
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">
              {selectedLanguage?.flag} {selectedLanguage?.native}
            </span>
            <span className="sm:hidden">
              {selectedLanguage?.value.toUpperCase()}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="end">
        <Command>
          <CommandInput 
            placeholder="Buscar idioma..." 
            aria-label="Buscar idioma"
          />
          <CommandList>
            <CommandEmpty>Nenhum idioma encontrado.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.value}
                  value={`${language.label} ${language.native}`}
                  onSelect={() => handleLanguageChange(language.value)}
                  className="flex items-center gap-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      locale === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{language.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {language.native}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
