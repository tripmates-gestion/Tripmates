#!/bin/bash

# Base URL - using the Docker container's exposed port
BASE_URL="http://localhost:8080"

# Function to print a message in green
print_success() {
    echo -e "\033[0;32m$1\033[0m"
}

# Function to print an error in red
print_error() {
    echo -e "\033[0;31m$1\033[0m"
}

# Function to make a POST request
make_request() {
    local endpoint=$1
    local data=$2
    local description=$3
    local auth_header=$4
    local content_type=${5:-"application/json"}
    local method=${6:-"POST"}
    
    echo -n "$description... "
    
    # Create a temporary file for the data
    local temp_file=$(mktemp)
    echo "$data" > "$temp_file"
    
    # Build the curl command
    cmd="curl -s -w \"\n%{http_code}\" -X $method \"$BASE_URL$endpoint\""
    cmd+=" -H \"Content-Type: $content_type\""
    
    # Add JWT token if provided
    if [ ! -z "$auth_header" ]; then
        cmd+=" -H \"Authorization: Bearer $auth_header\""
    fi
    
    # Add data
    if [ "$content_type" == "application/json" ]; then
        cmd+=" -d @$temp_file"
    else
        # For multipart/form-data
        cmd+=" -F \"data=@$temp_file;type=application/json\""
    fi
    
    # Execute the command
    response=$(eval $cmd 2>&1)
    local status_code=$(echo "$response" | tail -n1)
    local json_response=$(echo "$response" | head -n -1)
    
    rm "$temp_file"  # Clean up temporary file
    
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        print_success "✅ Success! (Status: $status_code)"
        echo "$json_response"
        return 0
    else
        print_error "❌ Failed! (Status: $status_code)"
        echo "Response: $json_response"
        return 1
    fi
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# 1. Clean up existing data (optional)
echo -e "\n=== Cleaning up existing data (if any) ==="
# Add cleanup logic if needed

# 2. Register users
echo -e "\n=== Registering Users ==="

# Register Regular Users
make_request "/auth/register" '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "role": "USER"
}' "Registering Juan Pérez"

make_request "/auth/register" '{
    "name": "María García",
    "email": "maria@example.com",
    "password": "password123",
    "role": "USER"
}' "Registering María García"

make_request "/auth/register" '{
    "name": "Carlos López",
    "email": "carlos@example.com",
    "password": "password123",
    "role": "USER"
}' "Registering Carlos López"

# Register Business Accounts
make_request "/auth/register" '{
    "name": "Restaurante La Buena Mesa",
    "email": "info@labuenamesa.com",
    "password": "business123",
    "role": "BUSINESS",
    "businessType": "RESTAURANT"
}' "Registering Restaurant Business"

make_request "/auth/register" '{
    "name": "Hotel Playa Dorada",
    "email": "reservas@playadorada.com",
    "password": "business123",
    "role": "BUSINESS",
    "businessType": "HOTEL"
}' "Registering Hotel Business"

# 2. Login and get tokens
echo -e "\n=== Logging in users to get tokens ==="

# Login function
# Login function
login_user() {
    local email=$1
    local password=$2
    local var_name=$3
    
    echo -n "Logging in $email... "
    response=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    # Check if response contains accessToken
    if echo "$response" | grep -q '"accessToken"'; then
        # Extract token from response
        token=$(echo "$response" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
        
        if [ ! -z "$token" ]; then
            eval "$var_name=\"$token\""
            print_success "✅ Success!"
            return 0
        fi
    fi
    
    # If we get here, login failed
    print_error "❌ Failed!"
    echo "Response: $response"
    return 1
}

# Login users
login_user "juan@example.com" "password123" "USER1_TOKEN"
login_user "maria@example.com" "password123" "USER2_TOKEN"
login_user "carlos@example.com" "password123" "USER3_TOKEN"
login_user "info@labuenamesa.com" "business123" "RESTAURANT_TOKEN"
login_user "reservas@playadorada.com" "business123" "HOTEL_TOKEN"

# 3. Create publications (only for businesses)
echo -e "\n=== Creating Publications ==="

# Restaurant Publication 1
if [ ! -z "$RESTAURANT_TOKEN" ]; then
    # First, create a temporary JSON file for the data
    cat > /tmp/restaurant1_data.json << 'EOL'
    {
        "title": "Menú Especial de Otoño",
        "description": "Disfruta de nuestro menú de temporada con ingredientes frescos y locales.",
        "phoneNumber": "+54 11 1234-5678",
        "email": "reservas@labuenamesa.com",
        "location": "Av. Corrientes 1234, Buenos Aires",
        "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
        "attentionSchedule": {
            "openingTime": "12:00",
            "closingTime": "23:00"
        },
        "exceptionalClosingDays": ["2025-12-25", "2026-01-01"],
        "tags": ["restaurante", "comida", "menú", "especial"]
    }
EOL

    echo -n "Creating restaurant publication 1... "
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/publications/business" \
        -H "Authorization: Bearer $RESTAURANT_TOKEN" \
        -F "data=@/tmp/restaurant1_data.json;type=application/json")
    
    status_code=$(echo "$response" | tail -n1)
    json_response=$(echo "$response" | head -n -1)
    
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        print_success "✅ Success! (Status: $status_code)"
    else
        print_error "❌ Failed! (Status: $status_code)"
        echo "Response: $json_response"
    fi
    rm /tmp/restaurant1_data.json
fi

# Hotel Publication 1
if [ ! -z "$HOTEL_TOKEN" ]; then
    cat > /tmp/hotel1_data.json << 'EOL'
    {
        "title": "Escape a la Playa - Oferta Especial",
        "description": "Disfruta de unas vacaciones inolvidables frente al mar con nuestro paquete todo incluido.",
        "phoneNumber": "+54 11 8765-4321",
        "email": "info@playadorada.com",
        "location": "Av. Costanera 2500, Mar del Plata",
        "openingDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
        "attentionSchedule": {
            "openingTime": "00:00",
            "closingTime": "23:59"
        },
        "exceptionalClosingDays": [],
        "tags": ["hotel", "playa", "vacaciones", "todo incluido"]
    }
EOL

    echo -n "Creating hotel publication 1... "
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/publications/business" \
        -H "Authorization: Bearer $HOTEL_TOKEN" \
        -F "data=@/tmp/hotel1_data.json;type=application/json")
    
    status_code=$(echo "$response" | tail -n1)
    json_response=$(echo "$response" | head -n -1)
    
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        print_success "✅ Success! (Status: $status_code)"
    else
        print_error "❌ Failed! (Status: $status_code)"
        echo "Response: $json_response"
    fi
    rm /tmp/hotel1_data.json
fi

# Restaurant Publication 2
if [ ! -z "$RESTAURANT_TOKEN" ]; then
    cat > /tmp/restaurant2_data.json << 'EOL'
    {
        "title": "Cena Romántica con Vista al Río",
        "description": "Vive una experiencia gastronómica inolvidable con nuestra cena de 5 pasos y vino de la casa.",
        "phoneNumber": "+54 11 5555-1234",
        "email": "eventos@labuenamesa.com",
        "location": "Puerto Madero, Dique 2, Buenos Aires",
        "openingDays": ["THURSDAY", "FRIDAY", "SATURDAY"],
        "attentionSchedule": {
            "openingTime": "20:00",
            "closingTime": "00:00"
        },
        "exceptionalClosingDays": ["2025-12-24", "2025-12-31"],
        "tags": ["cena", "romántico", "vista al río", "alta cocina"]
    }
EOL

    echo -n "Creating restaurant publication 2... "
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/publications/business" \
        -H "Authorization: Bearer $RESTAURANT_TOKEN" \
        -F "data=@/tmp/restaurant2_data.json;type=application/json")
    
    status_code=$(echo "$response" | tail -n1)
    json_response=$(echo "$response" | head -n -1)
    
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        print_success "✅ Success! (Status: $status_code)"
    else
        print_error "❌ Failed! (Status: $status_code)"
        echo "Response: $json_response"
    fi
    rm /tmp/restaurant2_data.json
fi

# Hotel Publication 2
if [ ! -z "$HOTEL_TOKEN" ]; then
    cat > /tmp/hotel2_data.json << 'EOL'
    {
        "title": "Fin de Semana de Spa y Bienestar",
        "description": "Escápate del estrés con nuestro paquete de fin de semana que incluye masajes, tratamientos faciales y acceso completo a nuestras instalaciones de spa.",
        "phoneNumber": "+54 11 5555-9876",
        "email": "spa@playadorada.com",
        "location": "Ruta 11, Km 324, Cariló",
        "openingDays": ["FRIDAY", "SATURDAY", "SUNDAY"],
        "attentionSchedule": {
            "openingTime": "09:00",
            "closingTime": "21:00"
        },
        "exceptionalClosingDays": ["2025-12-24", "2025-12-25", "2025-12-31", "2026-01-01"],
        "tags": ["spa", "bienestar", "relax", "fin de semana"]
    }
EOL

    echo -n "Creating hotel publication 2... "
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/publications/business" \
        -H "Authorization: Bearer $HOTEL_TOKEN" \
        -F "data=@/tmp/hotel2_data.json;type=application/json")
    
    status_code=$(echo "$response" | tail -n1)
    json_response=$(echo "$response" | head -n -1)
    
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        print_success "✅ Success! (Status: $status_code)"
    else
        print_error "❌ Failed! (Status: $status_code)"
        echo "Response: $json_response"
    fi
    rm /tmp/hotel2_data.json
fi

# 4. Create restaurant menus and room packs
echo -e "\n=== Creating Restaurant Menus and Room Packs ==="

# Restaurant Menu for La Buena Mesa
if [ ! -z "$RESTAURANT_TOKEN" ]; then
    # Menu item 1 - Entrada
    cat > /tmp/menu_item1.json << 'EOL'
    {
        "foodName": "Milanesa Napolitana",
        "price": 3500,
        "description": "Milanesa de carne con salsa de tomate, jamón y queso gratinado. Acompañada con papas fritas."
    }
EOL

    # Menu item 2 - Pasta
    cat > /tmp/menu_item2.json << 'EOL'
    {
        "foodName": "Fettuccine Alfredo",
        "price": 2800,
        "description": "Pasta casera con salsa cremosa de queso parmesano, mantequilla y pimienta negra."
    }
EOL

    # Menu item 3 - Postre
    cat > /tmp/menu_item3.json << 'EOL'
    {
        "foodName": "Tiramisú Clásico",
        "price": 1800,
        "description": "Postre italiano con capas de bizcocho de soletilla humedecido en café y crema de mascarpone."
    }
EOL

    # Menu item 4 - Bebida
    cat > /tmp/menu_item4.json << 'EOL'
    {
        "foodName": "Limonada de Frutos Rojos",
        "price": 1200,
        "description": "Limonada natural con un toque de frutos rojos frescos y hierbabuena."
    }
EOL

    # Add all menu items
    for i in {1..4}; do
        echo -n "Adding menu item $i to La Buena Mesa... "
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/me/restaurant" \
            -H "Authorization: Bearer $RESTAURANT_TOKEN" \
            -F "data=@/tmp/menu_item$i.json;type=application/json")
        
        status_code=$(echo "$response" | tail -n1)
        if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
            print_success "✅ Success! (Status: $status_code)"
        else
            print_error "❌ Failed! (Status: $status_code)"
            echo "Response: $(echo "$response" | head -n -1)"
        fi
        rm "/tmp/menu_item$i.json"
    done
fi

# Room Packs for Hotel Playa Dorada
if [ ! -z "$HOTEL_TOKEN" ]; then
    # Room Pack 1 - Habitación Estándar
    cat > /tmp/room_pack1.json << 'EOL'
    {
        "checkInDate": "2025-12-20",
        "checkOutDate": "2025-12-27",
        "numberOfGuests": 2,
        "services": ["desayuno", "wifi", "piscina", "estacionamiento"],
        "price": 25000,
        "description": "Habitación doble con vista al mar. Incluye desayuno buffet y acceso a todas las instalaciones del hotel."
    }
EOL

    # Room Pack 2 - Suite Familiar
    cat > /tmp/room_pack2.json << 'EOL'
    {
        "checkInDate": "2025-12-20",
        "checkOutDate": "2025-12-25",
        "numberOfGuests": 4,
        "services": ["desayuno", "wifi", "piscina", "spa", "gimnasio", "estacionamiento"],
        "price": 45000,
        "description": "Amplia suite familiar con sala de estar y cocineta. Incluye acceso al spa y gimnasio."
    }
EOL

    # Room Pack 3 - Paquete Romántico
    cat > /tmp/room_pack3.json << 'EOL'
    {
        "checkInDate": "2026-02-14",
        "checkOutDate": "2026-02-16",
        "numberOfGuests": 2,
        "services": ["desayuno", "wifi", "piscina", "spa", "cena romántica", "champán"],
        "price": 35000,
        "description": "Paquete romántico para dos con cena a la luz de las velas, botella de champán y desayuno en la habitación."
    }
EOL

    # Add all room packs
    for i in {1..3}; do
        echo -n "Adding room pack $i to Hotel Playa Dorada... "
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/me/hosting" \
            -H "Authorization: Bearer $HOTEL_TOKEN" \
            -F "data=@/tmp/room_pack$i.json;type=application/json")
        
        status_code=$(echo "$response" | tail -n1)
        if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
            print_success "✅ Success! (Status: $status_code)"
        else
            print_error "❌ Failed! (Status: $status_code)"
            echo "Response: $(echo "$response" | head -n -1)"
        fi
        rm "/tmp/room_pack$i.json"
    done
fi

# 5. Add reviews to publications
echo -e "\n=== Adding Reviews to Publications ==="

# First, let's get the list of publications to get their IDs
if [ ! -z "$USER1_TOKEN" ] && [ ! -z "$RESTAURANT_TOKEN" ]; then
    echo -n "Getting list of publications... "
    
    # Instead of using /publications, let's use the search endpoint
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/publications/search" \
        -H "Authorization: Bearer $RESTAURANT_TOKEN" \
        -H "Content-Type: application/json")
    
    status_code=$(echo "$response" | tail -n1)
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        print_success "✅ Success! (Status: $status_code)"
        # Extract the first publication ID (assuming there's at least one)
        publication_id=$(echo "$response" | head -n -1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        
        if [ ! -z "$publication_id" ]; then
            # User 1 (Juan) reviews the restaurant
            cat > /tmp/review1.json << 'EOL'
            {
                "title": "Excelente experiencia",
                "content": "¡Excelente comida y servicio! La milanesa estaba deliciosa. Volveré seguro.",
                "rating": 5
            }
EOL
            echo -n "Adding Juan's review to the restaurant... "
            response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/publications/$publication_id/review" \
                -H "Authorization: Bearer $USER1_TOKEN" \
                -F "data=@/tmp/review1.json;type=application/json")
            
            status_code=$(echo "$response" | tail -n1)
            if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
                print_success "✅ Success! (Status: $status_code)"
            else
                print_error "❌ Failed! (Status: $status_code)"
                echo "Response: $(echo "$response" | head -n -1)"
            fi
            rm /tmp/review1.json

            # User 2 (María) reviews the same restaurant
            if [ ! -z "$USER2_TOKEN" ]; then
                cat > /tmp/review2.json << 'EOL'
                {
                    "title": "Muy buena experiencia",
                    "content": "Muy buena atención y platos deliciosos. El lugar es acogedor y la relación calidad-precio es excelente.",
                    "rating": 4
                }
EOL
                echo -n "Adding María's review to the restaurant... "
                response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/publications/$publication_id/review" \
                    -H "Authorization: Bearer $USER2_TOKEN" \
                    -F "data=@/tmp/review2.json;type=application/json")
                
                status_code=$(echo "$response" | tail -n1)
                if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
                    print_success "✅ Success! (Status: $status_code)"
                else
                    print_error "❌ Failed! (Status: $status_code)"
                    echo "Response: $(echo "$response" | head -n -1)"
                fi
                rm /tmp/review2.json
            fi
        else
            print_error "❌ No publications found to add reviews to"
        fi
    else
        print_error "❌ Failed to search publications (Status: $status_code)"
        echo "Response: $(echo "$response" | head -n -1)"
    fi
fi

echo -e "\n=== Sample data loading completed! ==="
echo -e "\nYou can now log in with:"
echo -e "\n=== Regular Users ==="
echo "- User 1: juan@example.com / password123"
echo "- User 2: maria@example.com / password123"
echo "- User 3: carlos@example.com / password123"

echo -e "\n=== Business Accounts ==="
echo "- Restaurant: info@labuenamesa.com / business123"
echo "- Hotel: reservas@playadorada.com / business123"

echo -e "\nNote: All users have the password 'password123' for testing purposes."