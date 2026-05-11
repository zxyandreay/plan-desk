#[tauri::command]
fn path_exists(path: String) -> bool {
  std::path::Path::new(&path).exists()
}

#[tauri::command]
fn save_text_file(path: String, contents: String) -> Result<(), String> {
  std::fs::write(&path, contents)
    .map_err(|error| format!("Could not save file to {}: {}", path, error))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_clipboard_manager::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![path_exists, save_text_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
