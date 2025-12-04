export enum IpcChannel {
  // App
  App_Info = 'app:info',
  App_Reload = 'app:reload',
  App_Quit = 'app:quit',
  App_SetTheme = 'app:set-theme',

  // Window
  Window_Minimize = 'window:minimize',
  Window_Maximize = 'window:maximize',
  Window_Close = 'window:close',
  Window_IsMaximized = 'window:is-maximized',
  Window_MaximizedChanged = 'window:maximized-changed',

  // Pacientes
  Paciente_Create = 'paciente:create',
  Paciente_Update = 'paciente:update',
  Paciente_Delete = 'paciente:delete',
  Paciente_GetById = 'paciente:get-by-id',
  Paciente_GetAll = 'paciente:get-all',
  Paciente_Search = 'paciente:search',

  // Doctores
  Doctor_Create = 'doctor:create',
  Doctor_Update = 'doctor:update',
  Doctor_Delete = 'doctor:delete',
  Doctor_GetById = 'doctor:get-by-id',
  Doctor_GetAll = 'doctor:get-all',
  Doctor_GetByEspecialidad = 'doctor:get-by-especialidad',

  // Citas
  Cita_Create = 'cita:create',
  Cita_Update = 'cita:update',
  Cita_Cancel = 'cita:cancel',
  Cita_Complete = 'cita:complete',
  Cita_GetById = 'cita:get-by-id',
  Cita_GetByPaciente = 'cita:get-by-paciente',
  Cita_GetByDoctor = 'cita:get-by-doctor',
  Cita_GetByFecha = 'cita:get-by-fecha',
  Cita_GetAll = 'cita:get-all',
  Cita_GetDisponibilidad = 'cita:get-disponibilidad',

  // Especialidades
  Especialidad_GetAll = 'especialidad:get-all',

  // Notificaciones
  Notification_Send = 'notification:send',
  Notification_OnClick = 'notification:on-click',

  // Config
  Config_Set = 'config:set',
  Config_Get = 'config:get',

  // Theme
  Theme_Updated = 'theme:updated',

  // Backup
  Backup_Export = 'backup:export',
  Backup_Import = 'backup:import'
}
