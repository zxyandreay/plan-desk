use serde::{Deserialize, Serialize};
use std::path::{Component, Path, PathBuf};

#[tauri::command]
fn path_exists(path: String) -> bool {
  std::path::Path::new(&path).exists()
}

#[tauri::command]
fn save_text_file(path: String, contents: String) -> Result<(), String> {
  std::fs::write(&path, contents)
    .map_err(|error| format!("Could not save file to {}: {}", path, error))
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FolderCreateItem {
  id: String,
  name: String,
  relative_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct FolderCreateResult {
  id: String,
  name: String,
  relative_path: String,
  path: String,
  status: String,
  message: Option<String>,
}

fn validate_relative_folder_path(relative_path: &str) -> Result<PathBuf, String> {
  let trimmed = relative_path.trim();
  if trimmed.is_empty() {
    return Err("Folder path is empty.".to_string());
  }

  let path = Path::new(trimmed);
  if path.is_absolute() {
    return Err("Folder template paths must be relative.".to_string());
  }

  let mut safe_path = PathBuf::new();
  for component in path.components() {
    match component {
      Component::Normal(part) => {
        let name = part.to_string_lossy();
        let invalid_chars = ['<', '>', ':', '"', '|', '?', '*'];
        if name.trim().is_empty() || name.chars().any(|character| invalid_chars.contains(&character)) {
          return Err(format!("Unsafe folder name: {}", name));
        }
        safe_path.push(part);
      }
      _ => return Err("Folder template paths cannot contain traversal segments.".to_string()),
    }
  }

  Ok(safe_path)
}

#[tauri::command]
fn create_directories(root_path: String, folders: Vec<FolderCreateItem>) -> Result<Vec<FolderCreateResult>, String> {
  let root = PathBuf::from(root_path.trim());
  if root.as_os_str().is_empty() {
    return Err("Choose a project root folder before creating folders.".to_string());
  }

  std::fs::create_dir_all(&root)
    .map_err(|error| format!("Could not create or access root folder {}: {}", root.display(), error))?;
  let canonical_root = root
    .canonicalize()
    .map_err(|error| format!("Could not verify root folder {}: {}", root.display(), error))?;

  let mut results = Vec::new();
  for folder in folders {
    match validate_relative_folder_path(&folder.relative_path) {
      Ok(relative_path) => {
        let destination = canonical_root.join(&relative_path);
        if !destination.starts_with(&canonical_root) {
          results.push(FolderCreateResult {
            id: folder.id,
            name: folder.name,
            relative_path: folder.relative_path,
            path: destination.display().to_string(),
            status: "failed".to_string(),
            message: Some("Folder path would escape the project root.".to_string()),
          });
          continue;
        }

        if destination.exists() {
          if destination.is_dir() {
            results.push(FolderCreateResult {
              id: folder.id,
              name: folder.name,
              relative_path: folder.relative_path,
              path: destination.display().to_string(),
              status: "existing".to_string(),
              message: Some("Folder already exists and was left unchanged.".to_string()),
            });
          } else {
            results.push(FolderCreateResult {
              id: folder.id,
              name: folder.name,
              relative_path: folder.relative_path,
              path: destination.display().to_string(),
              status: "failed".to_string(),
              message: Some("A file already exists at this folder path.".to_string()),
            });
          }
          continue;
        }

        match std::fs::create_dir_all(&destination) {
          Ok(_) => results.push(FolderCreateResult {
            id: folder.id,
            name: folder.name,
            relative_path: folder.relative_path,
            path: destination.display().to_string(),
            status: "created".to_string(),
            message: None,
          }),
          Err(error) => results.push(FolderCreateResult {
            id: folder.id,
            name: folder.name,
            relative_path: folder.relative_path,
            path: destination.display().to_string(),
            status: "failed".to_string(),
            message: Some(error.to_string()),
          }),
        }
      }
      Err(message) => results.push(FolderCreateResult {
        id: folder.id,
        name: folder.name,
        relative_path: folder.relative_path,
        path: String::new(),
        status: "failed".to_string(),
        message: Some(message),
      }),
    }
  }

  Ok(results)
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
    .invoke_handler(tauri::generate_handler![path_exists, save_text_file, create_directories])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
