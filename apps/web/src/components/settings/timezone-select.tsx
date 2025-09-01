"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TimeZone {
  value: string
  label: string
  region: string
  offset: string
}

const timeZones: TimeZone[] = [
  // América do Sul
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)", region: "América do Sul", offset: "-03:00" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (GMT-3)", region: "América do Sul", offset: "-03:00" },
  { value: "America/Santiago", label: "Santiago (GMT-3)", region: "América do Sul", offset: "-03:00" },
  { value: "America/Lima", label: "Lima (GMT-5)", region: "América do Sul", offset: "-05:00" },
  { value: "America/Bogota", label: "Bogotá (GMT-5)", region: "América do Sul", offset: "-05:00" },
  
  // América do Norte
  { value: "America/New_York", label: "Nova York (GMT-5/-4)", region: "América do Norte", offset: "-05:00/-04:00" },
  { value: "America/Chicago", label: "Chicago (GMT-6/-5)", region: "América do Norte", offset: "-06:00/-05:00" },
  { value: "America/Denver", label: "Denver (GMT-7/-6)", region: "América do Norte", offset: "-07:00/-06:00" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-8/-7)", region: "América do Norte", offset: "-08:00/-07:00" },
  { value: "America/Toronto", label: "Toronto (GMT-5/-4)", region: "América do Norte", offset: "-05:00/-04:00" },
  
  // Europa
  { value: "Europe/London", label: "Londres (GMT+0/+1)", region: "Europa", offset: "+00:00/+01:00" },
  { value: "Europe/Paris", label: "Paris (GMT+1/+2)", region: "Europa", offset: "+01:00/+02:00" },
  { value: "Europe/Berlin", label: "Berlim (GMT+1/+2)", region: "Europa", offset: "+01:00/+02:00" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1/+2)", region: "Europa", offset: "+01:00/+02:00" },
  { value: "Europe/Rome", label: "Roma (GMT+1/+2)", region: "Europa", offset: "+01:00/+02:00" },
  
  // Ásia
  { value: "Asia/Tokyo", label: "Tóquio (GMT+9)", region: "Ásia", offset: "+09:00" },
  { value: "Asia/Shanghai", label: "Xangai (GMT+8)", region: "Ásia", offset: "+08:00" },
  { value: "Asia/Seoul", label: "Seul (GMT+9)", region: "Ásia", offset: "+09:00" },
  { value: "Asia/Singapore", label: "Singapura (GMT+8)", region: "Ásia", offset: "+08:00" },
  { value: "Asia/Dubai", label: "Dubai (GMT+4)", region: "Ásia", offset: "+04:00" },
  
  // Oceania
  { value: "Australia/Sydney", label: "Sydney (GMT+10/+11)", region: "Oceania", offset: "+10:00/+11:00" },
  { value: "Australia/Melbourne", label: "Melbourne (GMT+10/+11)", region: "Oceania", offset: "+10:00/+11:00" },
  { value: "Pacific/Auckland", label: "Auckland (GMT+12/+13)", region: "Oceania", offset: "+12:00/+13:00" },
]

interface TimeZoneSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function TimeZoneSelect({ value, onValueChange, placeholder = "Selecione o timezone" }: TimeZoneSelectProps) {
  const [open, setOpen] = useState(false)

  const selectedTimeZone = timeZones.find((tz) => tz.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedTimeZone ? (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{selectedTimeZone.label}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {placeholder}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Buscar timezone..." />
          <CommandList>
            <CommandEmpty>Nenhum timezone encontrado.</CommandEmpty>
            {Object.entries(
              timeZones.reduce((acc, tz) => {
                if (!acc[tz.region]) acc[tz.region] = []
                acc[tz.region].push(tz)
                return acc
              }, {} as Record<string, TimeZone[]>)
            ).map(([region, zones]) => (
              <CommandGroup key={region} heading={region}>
                {zones.map((tz) => (
                  <CommandItem
                    key={tz.value}
                    value={`${tz.label} ${tz.region}`}
                    onSelect={() => {
                      onValueChange(tz.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === tz.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{tz.label}</span>
                      <span className="text-xs text-muted-foreground">{tz.region}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
