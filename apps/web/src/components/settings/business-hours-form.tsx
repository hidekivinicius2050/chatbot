"use client"

import { useState, useEffect } from "react"
import { Clock, Globe, Calendar, Save, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TimeZoneSelect } from "./timezone-select"
import { DayScheduleCard } from "./day-schedule-card"
import { cn } from "@/lib/utils"

interface DaySchedule {
  start: string // HH:MM
  end: string   // HH:MM
}

interface WeeklySchedule {
  mon?: DaySchedule | null
  tue?: DaySchedule | null
  wed?: DaySchedule | null
  thu?: DaySchedule | null
  fri?: DaySchedule | null
  sat?: DaySchedule | null
  sun?: DaySchedule | null
}

interface BusinessHoursFormProps {
  initialData?: {
    timezone: string
    weeklyJson: WeeklySchedule
  }
  onSave: (data: { timezone: string; weeklyJson: WeeklySchedule }) => Promise<void>
}

const defaultSchedule: WeeklySchedule = {
  mon: { start: "08:00", end: "18:00" },
  tue: { start: "08:00", end: "18:00" },
  wed: { start: "08:00", end: "18:00" },
  thu: { start: "08:00", end: "18:00" },
  fri: { start: "08:00", end: "18:00" },
  sat: null,
  sun: null,
}

export function BusinessHoursForm({ initialData, onSave }: BusinessHoursFormProps) {
  const [timezone, setTimezone] = useState(initialData?.timezone || "America/Sao_Paulo")
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(
    initialData?.weeklyJson || defaultSchedule
  )
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const days = [
    { key: "mon", label: "Seg" },
    { key: "tue", label: "Ter" },
    { key: "wed", label: "Qua" },
    { key: "thu", label: "Qui" },
    { key: "fri", label: "Sex" },
    { key: "sat", label: "Sáb" },
    { key: "sun", label: "Dom" },
  ]

  useEffect(() => {
    const initial = JSON.stringify(initialData?.weeklyJson || defaultSchedule)
    const current = JSON.stringify(weeklySchedule)
    setHasChanges(initial !== current || initialData?.timezone !== timezone)
  }, [weeklySchedule, timezone, initialData])

  const handleDayToggle = (day: keyof WeeklySchedule, active: boolean) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: active ? { start: "08:00", end: "18:00" } : null
    }))
  }

  const handleScheduleChange = (day: keyof WeeklySchedule, schedule: DaySchedule | null) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: schedule
    }))
  }

  const applyDefaultSchedule = () => {
    setWeeklySchedule(defaultSchedule)
    setTimezone("America/Sao_Paulo")
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave({
        timezone,
        weeklyJson: weeklySchedule
      })
      setHasChanges(false)
    } catch (error) {
      console.error("Erro ao salvar horários:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActiveDaysCount = () => {
    return Object.values(weeklySchedule).filter(Boolean).length
  }

  const getTotalHours = () => {
    let total = 0
    Object.values(weeklySchedule).forEach(day => {
      if (day) {
        const start = parseInt(day.start.split(":")[0]) + parseInt(day.start.split(":")[1]) / 60
        const end = parseInt(day.end.split(":")[0]) + parseInt(day.end.split(":")[1]) / 60
        total += end - start
      }
    })
    return Math.round(total * 10) / 10
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Horário de Atendimento</h2>
          <p className="text-muted-foreground mt-1">
            Configure os horários de funcionamento da sua empresa
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={applyDefaultSchedule}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Configuração Padrão
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timezone */}
          <Card className="shadow-midnight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-brand" />
                Fuso Horário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimeZoneSelect
                value={timezone}
                onValueChange={setTimezone}
                placeholder="Selecione o fuso horário"
              />
              <p className="text-sm text-muted-foreground mt-2">
                O fuso horário será usado para calcular os horários de atendimento
              </p>
            </CardContent>
          </Card>

          {/* Grade Semanal */}
          <Card className="shadow-midnight">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-brand" />
                Horários Semanais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {days.map(({ key, label }) => (
                  <DayScheduleCard
                    key={key}
                    day={key}
                    dayLabel={label}
                    schedule={weeklySchedule[key as keyof WeeklySchedule]}
                    isActive={!!weeklySchedule[key as keyof WeeklySchedule]}
                    onToggle={(active) => handleDayToggle(key as keyof WeeklySchedule, active)}
                    onScheduleChange={(schedule) => handleScheduleChange(key as keyof WeeklySchedule, schedule)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card className="shadow-midnight sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {getActiveDaysCount()}
                  </div>
                  <div className="text-xs text-muted-foreground">Dias ativos</div>
                </div>
                
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {getTotalHours()}
                  </div>
                  <div className="text-xs text-muted-foreground">Horas/semana</div>
                </div>
              </div>

              {/* Horários ativos */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Horários Configurados</h4>
                <div className="space-y-2">
                  {days.map(({ key, label }) => {
                    const day = weeklySchedule[key as keyof WeeklySchedule]
                    if (!day) return null
                    
                    return (
                      <div key={key} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-sm text-muted-foreground">
                          {day.start} - {day.end}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Status */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    getActiveDaysCount() > 0 ? "bg-success" : "bg-muted-foreground"
                  )} />
                  <span className="text-sm text-muted-foreground">
                    {getActiveDaysCount() > 0 
                      ? "Horários configurados" 
                      : "Nenhum horário configurado"
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
