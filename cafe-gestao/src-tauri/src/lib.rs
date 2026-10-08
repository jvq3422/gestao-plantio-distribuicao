use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let port: u16 = 14876;

  tauri::Builder::default()
    .plugin(tauri_plugin_localhost::Builder::new(port).build())
    .setup(move |app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      #[cfg(desktop)]
      {
        let url = format!("http://localhost:{}", port).parse().unwrap();
        let window = WebviewWindowBuilder::new(app, "main".to_string(), WebviewUrl::External(url))
          .title("Fazenda Recreio do Morro • Gestão Agronômica e Distribuição")
          .inner_size(1280.0, 820.0)
          .min_inner_size(900.0, 600.0)
          .center()
          .resizable(true)
          .build()?;

        if cfg!(debug_assertions) || std::env::var("TAURI_DEVTOOLS").is_ok() {
          let _ = window.open_devtools();
        }
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
