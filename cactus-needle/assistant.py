import json
from datetime import datetime
from typing import Literal

import needle


# ============================================================
# Tool implementations
# ============================================================

@needle.tool
def send_sms(phone_number: str, message: str):
    """Send an SMS message to a phone number.

    Args:
        phone_number: Recipient phone number.
        message: Message text.
    """
    return {
        "success": True,
        "action": "send_sms",
        "phone_number": phone_number,
        "message": message,
    }


@needle.tool
def make_phone_call(phone_number: str):
    """Make a phone call to a phone number.

    Args:
        phone_number: Phone number to call.
    """
    return {
        "success": True,
        "action": "make_phone_call",
        "phone_number": phone_number,
    }


@needle.tool
def open_map(location: str):
    """Open a map at a specific location.

    Args:
        location: Place, address, landmark, or city.
    """
    return {"success": True, "action": "open_map", "location": location}


@needle.tool
def get_route(origin: str, destination: str):
    """Find a driving route between two locations.

    Args:
        origin: Starting location.
        destination: Destination location.
    """
    return {
        "success": True,
        "action": "get_route",
        "origin": origin,
        "destination": destination,
    }


@needle.tool
def search_location(query: str):
    """Search for a place or location.

    Args:
        query: Place name, address, landmark, or location query.
    """
    return {"success": True, "action": "search_location", "query": query}


@needle.tool
def get_current_location():
    """Get the current device location."""
    return {
        "success": True,
        "latitude": 35.7000,
        "longitude": 51.4000,
        "city": "Tehran",
    }


@needle.tool
def share_location(contact: str):
    """Share the current device location with a contact.

    Args:
        contact: Contact name or phone number.
    """
    return {
        "success": True,
        "action": "share_location",
        "contact": contact,
    }


@needle.tool
def set_alarm(time: str, label: str = ""):
    """Set an alarm.

    Args:
        time: Alarm time.
        label: Optional alarm label.
    """
    return {
        "success": True,
        "action": "set_alarm",
        "time": time,
        "label": label,
    }


@needle.tool
def cancel_alarm(time: str):
    """Cancel an alarm at a specific time.

    Args:
        time: Alarm time.
    """
    return {"success": True, "action": "cancel_alarm", "time": time}


@needle.tool
def set_timer(duration: str):
    """Set a countdown timer.

    Args:
        duration: Duration such as 10 minutes or 30 seconds.
    """
    return {
        "success": True,
        "action": "set_timer",
        "duration": duration,
    }


@needle.tool
def cancel_timer():
    """Cancel the currently running timer."""
    return {"success": True, "action": "cancel_timer"}


@needle.tool
def get_weather(city: str):
    """Get current weather for a city.

    Args:
        city: City name.
    """
    return {
        "success": True,
        "city": city,
        "temperature_c": 24,
        "condition": "clear",
    }


@needle.tool
def get_weather_forecast(city: str, days: int = 3):
    """Get weather forecast for a city.

    Args:
        city: City name.
        days: Number of forecast days.
    """
    return {
        "success": True,
        "city": city,
        "days": days,
        "forecast": ["sunny", "cloudy", "sunny"],
    }


@needle.tool
def get_temperature(city: str):
    """Get the current temperature in a city.

    Args:
        city: City name.
    """
    return {
        "success": True,
        "city": city,
        "temperature_c": 24,
    }


@needle.tool
def open_app(app_name: str):
    """Open an application on the device.

    Args:
        app_name: Application name.
    """
    return {"success": True, "action": "open_app", "app": app_name}


@needle.tool
def close_app(app_name: str):
    """Close an application on the device.

    Args:
        app_name: Application name.
    """
    return {"success": True, "action": "close_app", "app": app_name}


@needle.tool
def search_web(query: str):
    """Search the web for information.

    Args:
        query: Search query.
    """
    return {"success": True, "action": "search_web", "query": query}


@needle.tool
def search_contacts(query: str):
    """Search device contacts.

    Args:
        query: Contact name or phone number.
    """
    return {"success": True, "action": "search_contacts", "query": query}


@needle.tool
def get_contact(name: str):
    """Get information about a contact.

    Args:
        name: Contact name.
    """
    return {
        "success": True,
        "name": name,
        "phone": "+989120000000",
    }


@needle.tool
def create_contact(name: str, phone_number: str):
    """Create a new contact.

    Args:
        name: Contact name.
        phone_number: Phone number.
    """
    return {
        "success": True,
        "action": "create_contact",
        "name": name,
        "phone_number": phone_number,
    }


@needle.tool
def delete_contact(name: str):
    """Delete a contact.

    Args:
        name: Contact name.
    """
    return {"success": True, "action": "delete_contact", "name": name}


@needle.tool
def send_email(recipient: str, subject: str, body: str):
    """Send an email.

    Args:
        recipient: Email address.
        subject: Email subject.
        body: Email body.
    """
    return {
        "success": True,
        "action": "send_email",
        "recipient": recipient,
        "subject": subject,
        "body": body,
    }


@needle.tool
def read_email(sender: str = ""):
    """Read emails optionally filtered by sender.

    Args:
        sender: Optional sender email or name.
    """
    return {
        "success": True,
        "action": "read_email",
        "sender": sender,
        "emails": [],
    }


@needle.tool
def delete_email(email_id: str):
    """Delete an email.

    Args:
        email_id: Email identifier.
    """
    return {"success": True, "action": "delete_email", "email_id": email_id}


@needle.tool
def create_calendar_event(title: str, date: str, time: str):
    """Create a calendar event.

    Args:
        title: Event title.
        date: Event date.
        time: Event time.
    """
    return {
        "success": True,
        "action": "create_calendar_event",
        "title": title,
        "date": date,
        "time": time,
    }


@needle.tool
def delete_calendar_event(title: str, date: str):
    """Delete a calendar event.

    Args:
        title: Event title.
        date: Event date.
    """
    return {
        "success": True,
        "action": "delete_calendar_event",
        "title": title,
        "date": date,
    }


@needle.tool
def list_calendar_events(date: str):
    """List calendar events for a date.

    Args:
        date: Date to inspect.
    """
    return {
        "success": True,
        "action": "list_calendar_events",
        "date": date,
        "events": [],
    }


@needle.tool
def set_brightness(level: int):
    """Set screen brightness.

    Args:
        level: Brightness from 0 to 100.
    """
    return {"success": True, "brightness": level}


@needle.tool
def increase_brightness(amount: int = 10):
    """Increase screen brightness.

    Args:
        amount: Percentage increase.
    """
    return {"success": True, "action": "increase_brightness", "amount": amount}


@needle.tool
def decrease_brightness(amount: int = 10):
    """Decrease screen brightness.

    Args:
        amount: Percentage decrease.
    """
    return {"success": True, "action": "decrease_brightness", "amount": amount}


@needle.tool
def set_volume(level: int):
    """Set device volume.

    Args:
        level: Volume from 0 to 100.
    """
    return {"success": True, "volume": level}


@needle.tool
def increase_volume(amount: int = 10):
    """Increase device volume.

    Args:
        amount: Percentage increase.
    """
    return {"success": True, "action": "increase_volume", "amount": amount}


@needle.tool
def decrease_volume(amount: int = 10):
    """Decrease device volume.

    Args:
        amount: Percentage decrease.
    """
    return {"success": True, "action": "decrease_volume", "amount": amount}


@needle.tool
def mute_device():
    """Mute device audio."""
    return {"success": True, "action": "mute_device"}


@needle.tool
def unmute_device():
    """Unmute device audio."""
    return {"success": True, "action": "unmute_device"}


@needle.tool
def play_music(song: str = "", artist: str = ""):
    """Play music.

    Args:
        song: Optional song title.
        artist: Optional artist name.
    """
    return {
        "success": True,
        "action": "play_music",
        "song": song,
        "artist": artist,
    }


@needle.tool
def pause_music():
    """Pause currently playing music."""
    return {"success": True, "action": "pause_music"}


@needle.tool
def resume_music():
    """Resume paused music."""
    return {"success": True, "action": "resume_music"}


@needle.tool
def next_track():
    """Skip to the next music track."""
    return {"success": True, "action": "next_track"}


@needle.tool
def previous_track():
    """Go back to the previous music track."""
    return {"success": True, "action": "previous_track"}


@needle.tool
def take_photo():
    """Take a photo using the device camera."""
    return {"success": True, "action": "take_photo"}


@needle.tool
def record_video(duration: int):
    """Record a video.

    Args:
        duration: Recording duration in seconds.
    """
    return {
        "success": True,
        "action": "record_video",
        "duration": duration,
    }


@needle.tool
def record_audio(duration: int):
    """Record audio.

    Args:
        duration: Recording duration in seconds.
    """
    return {
        "success": True,
        "action": "record_audio",
        "duration": duration,
    }


@needle.tool
def take_screenshot():
    """Take a screenshot of the device."""
    return {"success": True, "action": "take_screenshot"}


@needle.tool
def flashlight_on():
    """Turn on the device flashlight."""
    return {"success": True, "action": "flashlight_on"}


@needle.tool
def flashlight_off():
    """Turn off the device flashlight."""
    return {"success": True, "action": "flashlight_off"}


@needle.tool
def wifi_on():
    """Turn Wi-Fi on."""
    return {"success": True, "action": "wifi_on"}


@needle.tool
def wifi_off():
    """Turn Wi-Fi off."""
    return {"success": True, "action": "wifi_off"}


@needle.tool
def bluetooth_on():
    """Turn Bluetooth on."""
    return {"success": True, "action": "bluetooth_on"}


@needle.tool
def bluetooth_off():
    """Turn Bluetooth off."""
    return {"success": True, "action": "bluetooth_off"}


@needle.tool
def airplane_mode_on():
    """Turn airplane mode on."""
    return {"success": True, "action": "airplane_mode_on"}


@needle.tool
def airplane_mode_off():
    """Turn airplane mode off."""
    return {"success": True, "action": "airplane_mode_off"}


@needle.tool
def get_battery_status():
    """Get device battery status."""
    return {
        "success": True,
        "battery_percent": 72,
        "charging": False,
    }


@needle.tool
def enable_dark_mode():
    """Enable dark mode."""
    return {"success": True, "action": "enable_dark_mode"}


@needle.tool
def disable_dark_mode():
    """Disable dark mode."""
    return {"success": True, "action": "disable_dark_mode"}


@needle.tool
def lock_device():
    """Lock the device."""
    return {"success": True, "action": "lock_device"}


@needle.tool
def restart_device():
    """Restart the device."""
    return {"success": True, "action": "restart_device"}


@needle.tool
def open_settings():
    """Open device settings."""
    return {"success": True, "action": "open_settings"}


@needle.tool
def get_device_info():
    """Get device information."""
    return {
        "success": True,
        "device": "Test Android Phone",
        "os": "Android",
        "version": "15",
    }


@needle.tool
def create_note(title: str, content: str):
    """Create a note.

    Args:
        title: Note title.
        content: Note content.
    """
    return {
        "success": True,
        "action": "create_note",
        "title": title,
        "content": content,
    }


@needle.tool
def search_notes(query: str):
    """Search saved notes.

    Args:
        query: Search query.
    """
    return {"success": True, "action": "search_notes", "query": query}


@needle.tool
def delete_note(title: str):
    """Delete a note.

    Args:
        title: Note title.
    """
    return {"success": True, "action": "delete_note", "title": title}


@needle.tool
def create_reminder(text: str, time: str):
    """Create a reminder.

    Args:
        text: Reminder text.
        time: Reminder time.
    """
    return {
        "success": True,
        "action": "create_reminder",
        "text": text,
        "time": time,
    }


@needle.tool
def delete_reminder(text: str):
    """Delete a reminder.

    Args:
        text: Reminder description.
    """
    return {"success": True, "action": "delete_reminder", "text": text}


@needle.tool
def list_reminders():
    """List reminders."""
    return {"success": True, "action": "list_reminders", "reminders": []}


@needle.tool
def create_task(title: str, priority: Literal["low", "medium", "high"] = "medium"):
    """Create a task.

    Args:
        title: Task title.
        priority: Task priority.
    """
    return {
        "success": True,
        "action": "create_task",
        "title": title,
        "priority": priority,
    }


@needle.tool
def complete_task(title: str):
    """Complete a task.

    Args:
        title: Task title.
    """
    return {"success": True, "action": "complete_task", "title": title}


@needle.tool
def list_tasks():
    """List tasks."""
    return {"success": True, "action": "list_tasks", "tasks": []}


@needle.tool
def delete_task(title: str):
    """Delete a task.

    Args:
        title: Task title.
    """
    return {"success": True, "action": "delete_task", "title": title}


@needle.tool
def start_navigation(destination: str):
    """Start navigation to a destination.

    Args:
        destination: Destination location.
    """
    return {
        "success": True,
        "action": "start_navigation",
        "destination": destination,
    }


@needle.tool
def stop_navigation():
    """Stop current navigation."""
    return {"success": True, "action": "stop_navigation"}


@needle.tool
def get_navigation_status():
    """Get current navigation status."""
    return {
        "success": True,
        "action": "get_navigation_status",
        "navigating": False,
    }


@needle.tool
def open_neshan(destination: str):
    """Open Neshan navigation for a destination.

    Args:
        destination: Destination location.
    """
    return {
        "success": True,
        "action": "open_neshan",
        "destination": destination,
    }


@needle.tool
def open_google_maps(destination: str):
    """Open Google Maps for a destination.

    Args:
        destination: Destination location.
    """
    return {
        "success": True,
        "action": "open_google_maps",
        "destination": destination,
    }


@needle.tool
def get_coordinates(location: str):
    """Convert a location into latitude and longitude.

    Args:
        location: Address or place name.
    """
    return {
        "success": True,
        "location": location,
        "latitude": 35.7000,
        "longitude": 51.4000,
    }


@needle.tool
def share_text(contact: str, text: str):
    """Share text with a contact.

    Args:
        contact: Contact name.
        text: Text to share.
    """
    return {
        "success": True,
        "action": "share_text",
        "contact": contact,
        "text": text,
    }


@needle.tool
def share_photo(contact: str):
    """Share the latest photo with a contact.

    Args:
        contact: Contact name.
    """
    return {
        "success": True,
        "action": "share_photo",
        "contact": contact,
    }


@needle.tool
def upload_file(path: str, destination: str):
    """Upload a file.

    Args:
        path: Local file path.
        destination: Upload destination.
    """
    return {
        "success": True,
        "action": "upload_file",
        "path": path,
        "destination": destination,
    }


@needle.tool
def download_file(url: str, destination: str):
    """Download a file.

    Args:
        url: File URL.
        destination: Local destination path.
    """
    return {
        "success": True,
        "action": "download_file",
        "url": url,
        "destination": destination,
    }


@needle.tool
def open_file(path: str):
    """Open a file.

    Args:
        path: File path.
    """
    return {"success": True, "action": "open_file", "path": path}


@needle.tool
def delete_file(path: str):
    """Delete a file.

    Args:
        path: File path.
    """
    return {"success": True, "action": "delete_file", "path": path}


@needle.tool
def search_files(query: str):
    """Search files on the device.

    Args:
        query: Filename or content search query.
    """
    return {"success": True, "action": "search_files", "query": query}


@needle.tool
def create_folder(path: str):
    """Create a folder.

    Args:
        path: Folder path.
    """
    return {"success": True, "action": "create_folder", "path": path}


@needle.tool
def delete_folder(path: str):
    """Delete a folder.

    Args:
        path: Folder path.
    """
    return {"success": True, "action": "delete_folder", "path": path}


@needle.tool
def get_storage_status():
    """Get device storage information."""
    return {
        "success": True,
        "free_gb": 64,
        "total_gb": 128,
    }


@needle.tool
def set_language(language: str):
    """Change device language.

    Args:
        language: Language name or language code.
    """
    return {
        "success": True,
        "action": "set_language",
        "language": language,
    }


@needle.tool
def translate_text(text: str, target_language: str):
    """Translate text into another language.

    Args:
        text: Text to translate.
        target_language: Target language.
    """
    return {
        "success": True,
        "action": "translate_text",
        "text": text,
        "target_language": target_language,
    }


@needle.tool
def summarize_text(text: str):
    """Summarize text.

    Args:
        text: Text to summarize.
    """
    return {
        "success": True,
        "action": "summarize_text",
        "text": text,
    }


@needle.tool
def calculate(expression: str):
    """Calculate a mathematical expression.

    Args:
        expression: Mathematical expression.
    """
    return {
        "success": True,
        "action": "calculate",
        "expression": expression,
        "result": "42",
    }


@needle.tool
def convert_currency(amount: float, from_currency: str, to_currency: str):
    """Convert an amount between currencies.

    Args:
        amount: Amount to convert.
        from_currency: Source currency.
        to_currency: Target currency.
    """
    return {
        "success": True,
        "action": "convert_currency",
        "amount": amount,
        "from_currency": from_currency,
        "to_currency": to_currency,
        "converted": 0,
    }


@needle.tool
def convert_units(value: float, from_unit: str, to_unit: str):
    """Convert between measurement units.

    Args:
        value: Value to convert.
        from_unit: Source unit.
        to_unit: Destination unit.
    """
    return {
        "success": True,
        "action": "convert_units",
        "value": value,
        "from_unit": from_unit,
        "to_unit": to_unit,
    }


@needle.tool
def get_time(timezone: str = "local"):
    """Get the current time.

    Args:
        timezone: Timezone name.
    """
    return {
        "success": True,
        "timezone": timezone,
        "time": datetime.now().isoformat(),
    }


@needle.tool
def get_date():
    """Get the current date."""
    return {
        "success": True,
        "date": datetime.now().date().isoformat(),
    }


@needle.tool
def set_wallpaper(path: str):
    """Set device wallpaper.

    Args:
        path: Image path.
    """
    return {"success": True, "action": "set_wallpaper", "path": path}


@needle.tool
def enable_location():
    """Enable device location services."""
    return {"success": True, "action": "enable_location"}


@needle.tool
def disable_location():
    """Disable device location services."""
    return {"success": True, "action": "disable_location"}


@needle.tool
def enable_notifications():
    """Enable notifications."""
    return {"success": True, "action": "enable_notifications"}


@needle.tool
def disable_notifications():
    """Disable notifications."""
    return {"success": True, "action": "disable_notifications"}


@needle.tool
def enable_do_not_disturb():
    """Enable do not disturb mode."""
    return {"success": True, "action": "enable_do_not_disturb"}


@needle.tool
def disable_do_not_disturb():
    """Disable do not disturb mode."""
    return {"success": True, "action": "disable_do_not_disturb"}


@needle.tool
def set_screen_timeout(seconds: int):
    """Set screen timeout.

    Args:
        seconds: Timeout in seconds.
    """
    return {
        "success": True,
        "action": "set_screen_timeout",
        "seconds": seconds,
    }


@needle.tool
def get_network_status():
    """Get network connectivity status."""
    return {
        "success": True,
        "wifi": True,
        "mobile_data": True,
        "connected": True,
    }


@needle.tool
def enable_mobile_data():
    """Enable mobile data."""
    return {"success": True, "action": "enable_mobile_data"}


@needle.tool
def disable_mobile_data():
    """Disable mobile data."""
    return {"success": True, "action": "disable_mobile_data"}


@needle.tool
def clear_notifications():
    """Clear all notifications."""
    return {"success": True, "action": "clear_notifications"}


@needle.tool
def read_notifications():
    """Read recent notifications."""
    return {
        "success": True,
        "action": "read_notifications",
        "notifications": [],
    }


@needle.tool
def open_notification(app_name: str):
    """Open a notification from an application.

    Args:
        app_name: Application name.
    """
    return {
        "success": True,
        "action": "open_notification",
        "app_name": app_name,
    }


@needle.tool
def set_default_browser(browser: str):
    """Set the default browser.

    Args:
        browser: Browser application name.
    """
    return {
        "success": True,
        "action": "set_default_browser",
        "browser": browser,
    }


@needle.tool
def open_url(url: str):
    """Open a URL in the browser.

    Args:
        url: URL to open.
    """
    return {"success": True, "action": "open_url", "url": url}


@needle.tool
def search_youtube(query: str):
    """Search YouTube.

    Args:
        query: YouTube search query.
    """
    return {
        "success": True,
        "action": "search_youtube",
        "query": query,
    }


@needle.tool
def play_youtube_video(query: str):
    """Search for and play a YouTube video.

    Args:
        query: Video search query.
    """
    return {
        "success": True,
        "action": "play_youtube_video",
        "query": query,
    }


@needle.tool
def search_spotify(query: str):
    """Search Spotify for music.

    Args:
        query: Music search query.
    """
    return {
        "success": True,
        "action": "search_spotify",
        "query": query,
    }


@needle.tool
def set_music_volume(level: int):
    """Set music volume.

    Args:
        level: Volume from 0 to 100.
    """
    return {
        "success": True,
        "action": "set_music_volume",
        "level": level,
    }


@needle.tool
def get_device_time():
    """Get the current device time."""
    return {
        "success": True,
        "time": datetime.now().strftime("%H:%M:%S"),
    }


@needle.tool
def get_device_date():
    """Get the current device date."""
    return {
        "success": True,
        "date": datetime.now().strftime("%Y-%m-%d"),
    }


# ============================================================
# Collect tools
# ============================================================

TOOLS = [
    send_sms,
    make_phone_call,
    open_map,
    get_route,
    search_location,
    get_current_location,
    share_location,
    set_alarm,
    cancel_alarm,
    set_timer,
    cancel_timer,
    get_weather,
    get_weather_forecast,
    get_temperature,
    open_app,
    close_app,
    search_web,
    search_contacts,
    get_contact,
    create_contact,
    delete_contact,
    send_email,
    read_email,
    delete_email,
    create_calendar_event,
    delete_calendar_event,
    list_calendar_events,
    set_brightness,
    increase_brightness,
    decrease_brightness,
    set_volume,
    increase_volume,
    decrease_volume,
    mute_device,
    unmute_device,
    play_music,
    pause_music,
    resume_music,
    next_track,
    previous_track,
    take_photo,
    record_video,
    record_audio,
    take_screenshot,
    flashlight_on,
    flashlight_off,
    wifi_on,
    wifi_off,
    bluetooth_on,
    bluetooth_off,
    airplane_mode_on,
    airplane_mode_off,
    get_battery_status,
    enable_dark_mode,
    disable_dark_mode,
    lock_device,
    restart_device,
    open_settings,
    get_device_info,
    create_note,
    search_notes,
    delete_note,
    create_reminder,
    delete_reminder,
    list_reminders,
    create_task,
    complete_task,
    list_tasks,
    delete_task,
    start_navigation,
    stop_navigation,
    get_navigation_status,
    open_neshan,
    open_google_maps,
    get_coordinates,
    share_text,
    share_photo,
    upload_file,
    download_file,
    open_file,
    delete_file,
    search_files,
    create_folder,
    delete_folder,
    get_storage_status,
    set_language,
    translate_text,
    summarize_text,
    calculate,
    convert_currency,
    convert_units,
    get_time,
    get_date,
    set_wallpaper,
    enable_location,
    disable_location,
    enable_notifications,
    disable_notifications,
    enable_do_not_disturb,
    disable_do_not_disturb,
    set_screen_timeout,
    get_network_status,
    enable_mobile_data,
    disable_mobile_data,
    clear_notifications,
    read_notifications,
    open_notification,
    set_default_browser,
    open_url,
    search_youtube,
    play_youtube_video,
    search_spotify,
    set_music_volume,
    get_device_time,
    get_device_date,
]


# ============================================================
# Needle agent
# ============================================================

print(f"Loaded {len(TOOLS)} tools.")

agent = needle.Needle(
    tools=TOOLS,
    system=(
        "date: 2026-09-22 Tue 16:00; "
        "locale: fa-IR; "
        "device: Android phone; "
        "assistant: Persian mobile voice assistant"
    ),
    tool_index_path="needle_tools.idx",
)


# ============================================================
# Interactive test
# ============================================================

def print_response(response: dict):
    print("\n" + "=" * 70)

    print("TYPE:")
    print(response.get("type"))

    print("\nCONFIDENCE:")
    print(response.get("confidence"))

    print("\nREASONING:")
    print(response.get("reasoning"))

    print("\nFUNCTION CALLS:")
    print(
        json.dumps(
            response.get("function_calls", []),
            ensure_ascii=False,
            indent=2,
        )
    )

    print("\nSUPPRESSED CALLS:")
    print(
        json.dumps(
            response.get("suppressed_calls", []),
            ensure_ascii=False,
            indent=2,
        )
    )

    print("\nPERFORMANCE:")
    print(f"Prefill: {response.get('prefill_tps')} tok/s")
    print(f"Decode:  {response.get('decode_tps')} tok/s")

    print("=" * 70)


def main():
    print("\nNeedle 3 - 100 Tool Test")
    print("Type Persian or English commands.")
    print("Type 'exit' to quit.\n")

    while True:
        try:
            print("You >")
            lines = []

            while True:
                line = input()

                if line == "":
                    break

                lines.append(line)

            query = "\n".join(lines).strip()
        except (KeyboardInterrupt, EOFError):
            print()
            break

        if not query:
            continue

        if query.lower() in {"exit", "quit", "q"}:
            break

        response = agent.complete(
            query,
            max_new_tokens=512,
        )

        print_response(response)

        calls = response.get("function_calls", [])

        if calls:
            print("\nExecuting tools...\n")

            for call in calls:
                name = call["name"]
                arguments = call["arguments"]

                print(f"→ {name}")
                print(
                    json.dumps(
                        arguments,
                        ensure_ascii=False,
                        indent=2,
                    )
                )

                tool = next(
                    (t for t in TOOLS if t.__name__ == name),
                    None,
                )

                if tool is None:
                    print("Tool implementation not found.")
                    continue

                try:
                    result = tool(**arguments)

                    print("Result:")
                    print(
                        json.dumps(
                            result,
                            ensure_ascii=False,
                            indent=2,
                        )
                    )

                except Exception as exc:
                    print(f"Tool execution error: {exc}")


if __name__ == "__main__":
    main()