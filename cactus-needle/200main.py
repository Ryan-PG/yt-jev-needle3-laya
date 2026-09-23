import needle

# ==========================================
# DOMAIN 1: SMART HOME (Tools 1-10)
# ==========================================

@needle.tool
def home_turn_on_light(room: str):
    """Turn on the light in a specific room."""
    print(f"[TOOL] home_turn_on_light({room})")
    return {"success": True, "room": room, "state": "on"}

@needle.tool
def home_turn_off_light(room: str):
    """Turn off the light in a specific room."""
    print(f"[TOOL] home_turn_off_light({room})")
    return {"success": True, "room": room, "state": "off"}

@needle.tool
def home_set_thermostat(temperature: int):
    """Set the home thermostat temperature."""
    print(f"[TOOL] home_set_thermostat({temperature})")
    return {"success": True, "temperature": temperature}

@needle.tool
def home_lock_doors(section: str):
    """Lock the doors in a house section."""
    print(f"[TOOL] home_lock_doors({section})")
    return {"success": True, "section": section, "status": "locked"}

@needle.tool
def home_unlock_doors(section: str):
    """Unlock the doors in a house section."""
    print(f"[TOOL] home_unlock_doors({section})")
    return {"success": True, "section": section, "status": "unlocked"}

@needle.tool
def home_check_camera(camera_id: str):
    """Check a specific security camera feed."""
    print(f"[TOOL] home_check_camera({camera_id})")
    return {"success": True, "camera_id": camera_id, "status": "active"}

@needle.tool
def home_play_music(playlist: str, room: str):
    """Play music on a smart speaker in a room."""
    print(f"[TOOL] home_play_music({playlist}, {room})")
    return {"success": True, "playlist": playlist, "room": room}

@needle.tool
def home_open_blinds(room: str):
    """Open the automated window blinds in a room."""
    print(f"[TOOL] home_open_blinds({room})")
    return {"success": True, "room": room, "state": "open"}

@needle.tool
def home_close_blinds(room: str):
    """Close the automated window blinds in a room."""
    print(f"[TOOL] home_close_blinds({room})")
    return {"success": True, "room": room, "state": "closed"}

@needle.tool
def home_start_vacuum(mode: str):
    """Start the robot vacuum cleaner."""
    print(f"[TOOL] home_start_vacuum({mode})")
    return {"success": True, "mode": mode, "status": "cleaning"}


# ==========================================
# DOMAIN 2: WEATHER & ENVIRONMENT (Tools 11-20)
# ==========================================

@needle.tool
def weather_get_current(city: str):
    """Get the current weather for a city."""
    print(f"[TOOL] weather_get_current({city})")
    return {"city": city, "temperature": 27, "condition": "clear"}

@needle.tool
def weather_get_forecast(city: str, days: int):
    """Get the weather forecast for upcoming days."""
    print(f"[TOOL] weather_get_forecast({city}, {days})")
    return {"city": city, "days": days, "forecast": "sunny"}

@needle.tool
def weather_get_air_quality(city: str):
    """Check air quality index for a city."""
    print(f"[TOOL] weather_get_air_quality({city})")
    return {"city": city, "aqi": 42, "status": "good"}

@needle.tool
def weather_get_uv_index(city: str):
    """Get the current UV index for a location."""
    print(f"[TOOL] weather_get_uv_index({city})")
    return {"city": city, "uv_index": 6}

@needle.tool
def weather_get_wind_speed(city: str):
    """Get current wind speed and direction."""
    print(f"[TOOL] weather_get_wind_speed({city})")
    return {"city": city, "speed_kmh": 15, "direction": "NW"}

@needle.tool
def weather_get_humidity(city: str):
    """Get current humidity percentage."""
    print(f"[TOOL] weather_get_humidity({city})")
    return {"city": city, "humidity": 45}

@needle.tool
def weather_check_storm_warning(region: str):
    """Check for active storm warnings in a region."""
    print(f"[TOOL] weather_check_storm_warning({region})")
    return {"region": region, "warning": False}

@needle.tool
def weather_get_sunrise_sunset(city: str):
    """Get sunrise and sunset times for a city."""
    print(f"[TOOL] weather_get_sunrise_sunset({city})")
    return {"city": city, "sunrise": "06:12 AM", "sunset": "07:45 PM"}

@needle.tool
def weather_get_radar_map(city: str):
    """Fetch weather radar map status."""
    print(f"[TOOL] weather_get_radar_map({city})")
    return {"city": city, "radar": "clear"}

@needle.tool
def weather_get_pollen_count(city: str):
    """Get pollen count and allergy forecast."""
    print(f"[TOOL] weather_get_pollen_count({city})")
    return {"city": city, "pollen_level": "low"}


# ==========================================
# DOMAIN 3: COMMUNICATION (Tools 21-30)
# ==========================================

@needle.tool
def comms_send_email(to: str, subject: str, body: str):
    """Send an email to a recipient."""
    print(f"[TOOL] comms_send_email({to})")
    return {"success": True, "to": to, "subject": subject}

@needle.tool
def comms_read_emails(folder: str):
    """Read unread emails from a folder."""
    print(f"[TOOL] comms_read_emails({folder})")
    return {"success": True, "folder": folder, "unread_count": 3}

@needle.tool
def comms_send_sms(phone_number: str, message: str):
    """Send a text message to a phone number."""
    print(f"[TOOL] comms_send_sms({phone_number})")
    return {"success": True, "phone": phone_number}

@needle.tool
def comms_make_call(contact_name: str):
    """Initiate a phone call to a contact."""
    print(f"[TOOL] comms_make_call({contact_name})")
    return {"success": True, "contact": contact_name}

@needle.tool
def comms_send_slack_message(channel: str, text: str):
    """Send a message to a Slack channel."""
    print(f"[TOOL] comms_send_slack_message({channel})")
    return {"success": True, "channel": channel}

@needle.tool
def comms_send_discord_message(channel_id: str, message: str):
    """Send a message to a Discord channel."""
    print(f"[TOOL] comms_send_discord_message({channel_id})")
    return {"success": True, "channel_id": channel_id}

@needle.tool
def comms_search_contacts(name: str):
    """Search address book for a contact."""
    print(f"[TOOL] comms_search_contacts({name})")
    return {"success": True, "name": name, "found": True}

@needle.tool
def comms_create_contact(name: str, phone: str):
    """Create a new contact in the address book."""
    print(f"[TOOL] comms_create_contact({name})")
    return {"success": True, "name": name}

@needle.tool
def comms_forward_email(email_id: str, recipient: str):
    """Forward an email to another user."""
    print(f"[TOOL] comms_forward_email({email_id})")
    return {"success": True, "recipient": recipient}

@needle.tool
def comms_set_away_message(status_text: str):
    """Set an automated away message status."""
    print(f"[TOOL] comms_set_away_message({status_text})")
    return {"success": True, "status": status_text}


# ==========================================
# DOMAIN 4: FINANCE & BANKING (Tools 31-40)
# ==========================================

@needle.tool
def finance_check_balance(account_type: str):
    """Check account balance for a specific account."""
    print(f"[TOOL] finance_check_balance({account_type})")
    return {"success": True, "account": account_type, "balance": 5420.50}

@needle.tool
def finance_transfer_funds(from_account: str, to_account: str, amount: float):
    """Transfer funds between accounts."""
    print(f"[TOOL] finance_transfer_funds({amount})")
    return {"success": True, "amount": amount}

@needle.tool
def finance_pay_bill(biller: str, amount: float):
    """Pay a utility or credit card bill."""
    print(f"[TOOL] finance_pay_bill({biller}, {amount})")
    return {"success": True, "biller": biller, "amount": amount}

@needle.tool
def finance_get_stock_price(ticker: str):
    """Get the current stock price for a ticker symbol."""
    print(f"[TOOL] finance_get_stock_price({ticker})")
    return {"ticker": ticker, "price": 182.50}

@needle.tool
def finance_buy_stock(ticker: str, shares: int):
    """Buy shares of a stock."""
    print(f"[TOOL] finance_buy_stock({ticker}, {shares})")
    return {"success": True, "ticker": ticker, "shares": shares}

@needle.tool
def finance_sell_stock(ticker: str, shares: int):
    """Sell shares of a stock."""
    print(f"[TOOL] finance_sell_stock({ticker}, {shares})")
    return {"success": True, "ticker": ticker, "shares": shares}

@needle.tool
def finance_get_crypto_price(coin: str):
    """Get current cryptocurrency price."""
    print(f"[TOOL] finance_get_crypto_price({coin})")
    return {"coin": coin, "price_usd": 64200.00}

@needle.tool
def finance_list_transactions(limit: int):
    """List recent banking transactions."""
    print(f"[TOOL] finance_list_transactions({limit})")
    return {"success": True, "transactions": []}

@needle.tool
def finance_set_budget_limit(category: str, limit_amount: float):
    """Set a monthly budget limit for a category."""
    print(f"[TOOL] finance_set_budget_limit({category}, {limit_amount})")
    return {"success": True, "category": category, "limit": limit_amount}

@needle.tool
def finance_get_credit_score():
    """Retrieve current credit score report."""
    print(f"[TOOL] finance_get_credit_score()")
    return {"success": True, "credit_score": 765}


# ==========================================
# DOMAIN 5: CALENDAR & TASKS (Tools 41-50)
# ==========================================

@needle.tool
def calendar_create_event(title: str, date: str, time: str):
    """Create a new calendar event."""
    print(f"[TOOL] calendar_create_event({title})")
    return {"success": True, "title": title, "date": date}

@needle.tool
def calendar_list_events(date: str):
    """List events scheduled for a specific date."""
    print(f"[TOOL] calendar_list_events({date})")
    return {"success": True, "date": date, "events": []}

@needle.tool
def calendar_delete_event(event_id: str):
    """Delete a calendar event by ID."""
    print(f"[TOOL] calendar_delete_event({event_id})")
    return {"success": True, "event_id": event_id}

@needle.tool
def calendar_invite_participant(event_id: str, email: str):
    """Invite someone to a calendar event."""
    print(f"[TOOL] calendar_invite_participant({event_id}, {email})")
    return {"success": True, "email": email}

@needle.tool
def tasks_add_task(task_name: str, priority: str):
    """Add a new item to your todo list."""
    print(f"[TOOL] tasks_add_task({task_name})")
    return {"success": True, "task": task_name, "priority": priority}

@needle.tool
def tasks_complete_task(task_name: str):
    """Mark a task as completed."""
    print(f"[TOOL] tasks_complete_task({task_name})")
    return {"success": True, "task": task_name, "status": "completed"}

@needle.tool
def tasks_list_tasks(status: str):
    """List tasks filtered by status."""
    print(f"[TOOL] tasks_list_tasks({status})")
    return {"success": True, "status": status, "tasks": []}

@needle.tool
def tasks_delete_task(task_name: str):
    """Delete a task from the list."""
    print(f"[TOOL] tasks_delete_task({task_name})")
    return {"success": True, "task": task_name}

@needle.tool
def notes_create_note(title: str, content: str):
    """Create a new personal note."""
    print(f"[TOOL] notes_create_note({title})")
    return {"success": True, "title": title}

@needle.tool
def notes_search_notes(keyword: str):
    """Search personal notes for a keyword."""
    print(f"[TOOL] notes_search_notes({keyword})")
    return {"success": True, "keyword": keyword, "results": []}


# ==========================================
# DOMAIN 6: HEALTH & FITNESS (Tools 51-60)
# ==========================================

@needle.tool
def health_log_workout(activity_type: str, duration_minutes: int):
    """Log a physical workout session."""
    print(f"[TOOL] health_log_workout({activity_type})")
    return {"success": True, "activity": activity_type, "duration": duration_minutes}

@needle.tool
def health_get_step_count(date: str):
    """Get total step count for a date."""
    print(f"[TOOL] health_get_step_count({date})")
    return {"success": True, "date": date, "steps": 8420}

@needle.tool
def health_log_water_intake(glasses: int):
    """Log daily water intake."""
    print(f"[TOOL] health_log_water_intake({glasses})")
    return {"success": True, "glasses_logged": glasses}

@needle.tool
def health_log_meal(meal_name: str, calories: int):
    """Log a meal and its calorie count."""
    print(f"[TOOL] health_log_meal({meal_name})")
    return {"success": True, "meal": meal_name, "calories": calories}

@needle.tool
def health_check_heart_rate():
    """Check current heart rate measurement."""
    print(f"[TOOL] health_check_heart_rate()")
    return {"success": True, "bpm": 72}

@needle.tool
def health_log_sleep(hours: float):
    """Log hours of sleep recorded."""
    print(f"[TOOL] health_log_sleep({hours})")
    return {"success": True, "hours": hours}

@needle.tool
def health_set_weight_goal(target_kg: float):
    """Set a target weight goal."""
    print(f"[TOOL] health_set_weight_goal({target_kg})")
    return {"success": True, "target_kg": target_kg}

@needle.tool
def health_get_bmi(weight_kg: float, height_cm: float):
    """Calculate Body Mass Index."""
    print(f"[TOOL] health_get_bmi()")
    return {"success": True, "bmi": 22.4}

@needle.tool
def health_schedule_doctor_appointment(doctor_name: str, date: str):
    """Schedule an appointment with a doctor."""
    print(f"[TOOL] health_schedule_doctor_appointment({doctor_name})")
    return {"success": True, "doctor": doctor_name, "date": date}

@needle.tool
def health_refill_prescription(medication_name: str):
    """Request a refill for a prescription medication."""
    print(f"[TOOL] health_refill_prescription({medication_name})")
    return {"success": True, "medication": medication_name}


# ==========================================
# DOMAIN 7: ENTERTAINMENT & MEDIA (Tools 61-70)
# ==========================================

@needle.tool
def media_play_movie(title: str, device: str):
    """Play a movie on a streaming device."""
    print(f"[TOOL] media_play_movie({title}, {device})")
    return {"success": True, "title": title, "device": device}

@needle.tool
def media_search_podcast(topic: str):
    """Search for podcasts by topic."""
    print(f"[TOOL] media_search_podcast({topic})")
    return {"success": True, "topic": topic}

@needle.tool
def media_set_volume(level: int):
    """Set the system or speaker volume level."""
    print(f"[TOOL] media_set_volume({level})")
    return {"success": True, "volume": level}

@needle.tool
def media_next_track():
    """Skip to the next audio track."""
    print(f"[TOOL] media_next_track()")
    return {"success": True, "action": "next"}

@needle.tool
def media_pause_playback():
    """Pause media playback."""
    print(f"[TOOL] media_pause_playback()")
    return {"success": True, "state": "paused"}

@needle.tool
def media_search_book(title: str):
    """Search for an audiobook or e-book."""
    print(f"[TOOL] media_search_book({title})")
    return {"success": True, "title": title}

@needle.tool
def media_get_trending_shows():
    """Get trending TV shows on streaming services."""
    print(f"[TOOL] media_get_trending_shows()")
    return {"success": True, "shows": ["Show A", "Show B"]}

@needle.tool
def media_add_to_watchlist(title: str):
    """Add a movie or show to your watchlist."""
    print(f"[TOOL] media_add_to_watchlist({title})")
    return {"success": True, "title": title}

@needle.tool
def media_get_concert_tickets(artist: str):
    """Search for concert tickets for an artist."""
    print(f"[TOOL] media_get_concert_tickets({artist})")
    return {"success": True, "artist": artist}

@needle.tool
def media_rate_media(title: str, rating: int):
    """Rate a movie, show, or song."""
    print(f"[TOOL] media_rate_media({title}, {rating})")
    return {"success": True, "title": title, "rating": rating}


# ==========================================
# DOMAIN 8: TRAVEL & NAVIGATION (Tools 71-80)
# ==========================================

@needle.tool
def travel_search_flights(origin: str, destination: str, date: str):
    """Search for airline flights."""
    print(f"[TOOL] travel_search_flights({origin} -> {destination})")
    return {"success": True, "origin": origin, "destination": destination}

@needle.tool
def travel_book_hotel(hotel_name: str, nights: int):
    """Book a hotel room."""
    print(f"[TOOL] travel_book_hotel({hotel_name})")
    return {"success": True, "hotel": hotel_name, "nights": nights}

@needle.tool
def travel_rent_car(location: str, car_type: str):
    """Rent a car at a travel destination."""
    print(f"[TOOL] travel_rent_car({location})")
    return {"success": True, "location": location, "car_type": car_type}

@needle.tool
def travel_get_directions(start: str, end: str):
    """Get driving or walking directions."""
    print(f"[TOOL] travel_get_directions({start} -> {end})")
    return {"success": True, "route": "Fastest route found"}

@needle.tool
def travel_check_flight_status(flight_number: str):
    """Check status of a flight."""
    print(f"[TOOL] travel_check_flight_status({flight_number})")
    return {"success": True, "flight": flight_number, "status": "On Time"}

@needle.tool
def travel_find_nearby_restaurants(cuisine: str):
    """Find nearby restaurants by cuisine type."""
    print(f"[TOOL] travel_find_nearby_restaurants({cuisine})")
    return {"success": True, "cuisine": cuisine}

@needle.tool
def travel_translate_phrase(phrase: str, target_language: str):
    """Translate a phrase into another language."""
    print(f"[TOOL] travel_translate_phrase({phrase})")
    return {"success": True, "translation": "Translated text"}

@needle.tool
def travel_convert_currency(amount: float, from_curr: str, to_curr: str):
    """Convert currency between different countries."""
    print(f"[TOOL] travel_convert_currency({amount})")
    return {"success": True, "converted_amount": amount * 1.1}

@needle.tool
def travel_get_time_zone(city: str):
    """Get the current time zone and local time for a city."""
    print(f"[TOOL] travel_get_time_zone({city})")
    return {"success": True, "city": city, "time": "14:30"}

@needle.tool
def travel_book_uber(pickup: str, dropoff: str):
    """Book a ride-share service."""
    print(f"[TOOL] travel_book_uber({pickup} -> {dropoff})")
    return {"success": True, "status": "Driver dispatched"}


# ==========================================
# DOMAIN 9: SHOPPING & E-COMMERCE (Tools 81-90)
# ==========================================

@needle.tool
def shop_search_product(item_name: str):
    """Search for products online."""
    print(f"[TOOL] shop_search_product({item_name})")
    return {"success": True, "item": item_name}

@needle.tool
def shop_add_to_cart(item_name: str, quantity: int):
    """Add a product to your shopping cart."""
    print(f"[TOOL] shop_add_to_cart({item_name})")
    return {"success": True, "item": item_name, "quantity": quantity}

@needle.tool
def shop_checkout_cart():
    """Complete checkout and purchase items in cart."""
    print(f"[TOOL] shop_checkout_cart()")
    return {"success": True, "order_status": "Placed"}

@needle.tool
def shop_track_package(tracking_number: str):
    """Track shipping status of a package."""
    print(f"[TOOL] shop_track_package({tracking_number})")
    return {"success": True, "tracking": tracking_number, "status": "In Transit"}

@needle.tool
def shop_cancel_order(order_id: str):
    """Cancel a pending online order."""
    print(f"[TOOL] shop_cancel_order({order_id})")
    return {"success": True, "order_id": order_id}

@needle.tool
def shop_apply_promo_code(code: str):
    """Apply a promotional discount code."""
    print(f"[TOOL] shop_apply_promo_code({code})")
    return {"success": True, "discount_applied": "15%"}

@needle.tool
def shop_add_to_wishlist(item_name: str):
    """Add an item to your online wishlist."""
    print(f"[TOOL] shop_add_to_wishlist({item_name})")
    return {"success": True, "item": item_name}

@needle.tool
def shop_request_refund(order_id: str, reason: str):
    """Request a refund for an order."""
    print(f"[TOOL] shop_request_refund({order_id})")
    return {"success": True, "reason": reason}

@needle.tool
def shop_find_nearest_store(store_name: str):
    """Find the nearest physical retail store location."""
    print(f"[TOOL] shop_find_nearest_store({store_name})")
    return {"success": True, "store": store_name}

@needle.tool
def shop_check_gift_card_balance(card_number: str):
    """Check remaining gift card balance."""
    print(f"[TOOL] shop_check_gift_card_balance({card_number})")
    return {"success": True, "balance": 50.00}


# ==========================================
# DOMAIN 10: SYSTEM & UTILITIES (Tools 91-100)
# ==========================================

@needle.tool
def system_check_battery():
    """Check device battery percentage and status."""
    print(f"[TOOL] system_check_battery()")
    return {"success": True, "battery_percentage": 88, "charging": False}

@needle.tool
def system_check_storage():
    """Check remaining disk storage space."""
    print(f"[TOOL] system_check_storage()")
    return {"success": True, "free_space_gb": 240}

@needle.tool
def system_set_brightness(level: int):
    """Set screen brightness level percentage."""
    print(f"[TOOL] system_set_brightness({level})")
    return {"success": True, "brightness": level}

@needle.tool
def system_toggle_wifi(state: str):
    """Turn Wi-Fi on or off."""
    print(f"[TOOL] system_toggle_wifi({state})")
    return {"success": True, "wifi": state}

@needle.tool
def system_toggle_bluetooth(state: str):
    """Turn Bluetooth on or off."""
    print(f"[TOOL] system_toggle_bluetooth({state})")
    return {"success": True, "bluetooth": state}

@needle.tool
def system_clear_cache():
    """Clear temporary system cache files."""
    print(f"[TOOL] system_clear_cache()")
    return {"success": True, "status": "cleared"}

@needle.tool
def system_restart_device():
    """Restart the operating system."""
    print(f"[TOOL] system_restart_device()")
    return {"success": True, "status": "restarting"}

@needle.tool
def system_run_virus_scan():
    """Run an antivirus scan on the device."""
    print(f"[TOOL] system_run_virus_scan()")
    return {"success": True, "threats_found": 0}

@needle.tool
def system_check_speedtest():
    """Run internet speed test."""
    print(f"[TOOL] system_check_speedtest()")
    return {"success": True, "download_mbps": 120, "upload_mbps": 45}

@needle.tool
def system_lock_screen():
    """Lock the computer or phone screen."""
    print(f"[TOOL] system_lock_screen()")
    return {"success": True, "status": "locked"}


# ==========================================
# AGENT SETUP & TERMINAL MENU LOOP
# ==========================================

# Collect all 100 tools into a single list
all_tools = [
    # Home (1-10)
    home_turn_on_light, home_turn_off_light, home_set_thermostat, home_lock_doors,
    home_unlock_doors, home_check_camera, home_play_music, home_open_blinds,
    home_close_blinds, home_start_vacuum,
    # Weather (11-20)
    weather_get_current, weather_get_forecast, weather_get_air_quality, weather_get_uv_index,
    weather_get_wind_speed, weather_get_humidity, weather_check_storm_warning,
    weather_get_sunrise_sunset, weather_get_radar_map, weather_get_pollen_count,
    # Comms (21-30)
    comms_send_email, comms_read_emails, comms_send_sms, comms_make_call,
    comms_send_slack_message, comms_send_discord_message, comms_search_contacts,
    comms_create_contact, comms_forward_email, comms_set_away_message,
    # Finance (31-40)
    finance_check_balance, finance_transfer_funds, finance_pay_bill, finance_get_stock_price,
    finance_buy_stock, finance_sell_stock, finance_get_crypto_price, finance_list_transactions,
    finance_set_budget_limit, finance_get_credit_score,
    # Calendar & Tasks (41-50)
    calendar_create_event, calendar_list_events, calendar_delete_event, calendar_invite_participant,
    tasks_add_task, tasks_complete_task, tasks_list_tasks, tasks_delete_task,
    notes_create_note, notes_search_notes,
    # Health (51-60)
    health_log_workout, health_get_step_count, health_log_water_intake, health_log_meal,
    health_check_heart_rate, health_log_sleep, health_set_weight_goal, health_get_bmi,
    health_schedule_doctor_appointment, health_refill_prescription,
    # Media (61-70)
    media_play_movie, media_search_podcast, media_set_volume, media_next_track,
    media_pause_playback, media_search_book, media_get_trending_shows, media_add_to_watchlist,
    media_get_concert_tickets, media_rate_media,
    # Travel (71-80)
    travel_search_flights, travel_book_hotel, travel_rent_car, travel_get_directions,
    travel_check_flight_status, travel_find_nearby_restaurants, travel_translate_phrase,
    travel_convert_currency, travel_get_time_zone, travel_book_uber,
    # Shopping (81-90)
    shop_search_product, shop_add_to_cart, shop_checkout_cart, shop_track_package,
    shop_cancel_order, shop_apply_promo_code, shop_add_to_wishlist, shop_request_refund,
    shop_find_nearest_store, shop_check_gift_card_balance,
    # System (91-100)
    system_check_battery, system_check_storage, system_set_brightness, system_toggle_wifi,
    system_toggle_bluetooth, system_clear_cache, system_restart_device, system_run_virus_scan,
    system_check_speedtest, system_lock_screen
]

# Initialize the Needle agent with all 100 tools
agent = needle.Needle(
    tools=all_tools,
    generation=3,
)
DEFAULT_TASKS = [
    "Check the weather in Tehran.",
    "Turn on the living room light.",
    "Send an email to alex@example.com about the project.",
    "Check my checking account balance.",
    "Log 2 glasses of water intake.",
    "Check my device battery status.",
]


def main():

    print(f"\n[INFO] Loaded {len(all_tools)} separate tools into Needle agent.")

    while True:
        print("\n" + "=" * 50)
        print("        NEEDLE AGENT TERMINAL (100 TOOLS)")
        print("=" * 50)
        print("1. Run default tasks one by one")
        print("2. Enter a custom command")
        print("3. Exit")
        print("-" * 50)

        choice = input("Select an option (1-3): ").strip()

        if choice == "1":
            print("\n[Running Default Tasks]\n")

            for index, task in enumerate(DEFAULT_TASKS, start=1):
                print("=" * 50)
                print(f"TASK {index}/{len(DEFAULT_TASKS)}")
                print(f"Prompt: {task}")
                print("-" * 50)

                result = agent.run(task)

                print("RESULT:")
                print(result)
                print()

        elif choice == "2":
            custom_prompt = input("\nEnter your command: ").strip()

            if custom_prompt:
                print(f"\n[Running Custom Command]:\n\"{custom_prompt}\"\n")

                result = agent.run(custom_prompt)

                print("\nRESULT:")
                print(result)
            else:
                print("\nCommand cannot be empty.")

        elif choice == "3":
            print("\nExiting. Goodbye!")
            break

        else:
            print("\nInvalid choice. Please enter 1, 2, or 3.")


if __name__ == "__main__":
    main()