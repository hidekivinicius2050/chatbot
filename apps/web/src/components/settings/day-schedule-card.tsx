"use client"

import { useState } from "react"
import { Clock, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface DaySchedule {
  start: string // HH:MM
  end: string   // HH:MM
}

interface DayScheduleCardProps {
  day: string
  dayLabel: string
  schedule: DaySchedule | null
  isActive: boolean
  onToggle: (active: boolean) => void
  onScheduleChange: (schedule: DaySchedule | null) => void
  disabled?: boolean
}

const dayNames: Record<string, string> = {
  mon: "Segunda-feira",
  tue: "Terça-feira",
  wed: "Quarta-feira",
  thu: "Quinta-feira",
  fri: "Sexta-feira",
  sat: "Sábado",
  sun: "Domingo",
}

const dayIcons: Record<string, string> = {
  mon: "1️⃣",
  tue: "2️⃣",
  wed: "3️⃣",
  thu: "4️⃣",
  fri: "5️⃣",
  sat: "6️⃣",
  sun: "7️⃣",
}

export function DayScheduleCard({
  day,
  dayLabel,
  schedule,
  isActive,
  onToggle,
  onScheduleChange,
  disabled = false
}: DayScheduleCardProps) {
  const [startTime, setStartTime] = useState(schedule?.start || "08:00")
  const [endTime, setEndTime] = useState(schedule?.end || "18:00")

  const handleToggle = (checked: boolean) => {
    onToggle(checked)
    if (checked && !schedule) {
      onScheduleChange({ start: startTime, end: endTime })
    } else if (!checked) {
      onScheduleChange(null)
    }
  }

  const handleTimeChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setStartTime(value)
      if (isActive) {
        onScheduleChange({ start: value, end: endTime })
      }
    } else {
      setEndTime(value)
      if (isActive) {
        onScheduleChange({ start: startTime, end: value })
      }
    }
  }

  const isValidTime = startTime < endTime

  return (
    <Card className={cn(
      "transition-all duration-200",
      isActive ? "ring-2 ring-brand/20 shadow-midnight" : "opacity-75",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{dayIcons[day]}</span>
            <div>
              <CardTitle className="text-base">{dayNames[day]}</CardTitle>
              <p className="text-sm text-muted-foreground">{dayLabel}</p>
            </div>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={disabled}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isActive ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`start-${day}`} className="text-sm font-medium">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Início
                </Label>
                <Input
                  id={`start-${day}`}
                  type="time"
                  value={startTime}
                  onChange={(e) => handleTimeChange("start", e.target.value)}
                  disabled={disabled}
                  className={cn(
                    "transition-colors",
                    !isValidTime && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`end-${day}`} className="text-sm font-medium">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Fim
                </Label>
                <Input
                  id={`end-${day}`}
                  type="time"
                  value={endTime}
                  onChange={(e) => handleTimeChange("end", e.target.value)}
                  disabled={disabled}
                  className={cn(
                    "transition-colors",
                    !isValidTime && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
            </div>

            {!isValidTime && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">
                ⚠️ Hora de fim deve ser maior que hora de início
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Horário configurado:</span>
              </div>
              <span className="text-sm font-medium">
                {startTime} - {endTime}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Dia inativo</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
