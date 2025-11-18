#!/bin/bash

# Base URL - using the Docker container's exposed port
BASE_URL="http://localhost:8080"

# Create directories for sample images if they don't exist
mkdir -p sample_images/{profile_pictures,publications/{restaurant,hotel},menu_items,room_packs,reviews}

# Function to print a message in green
print_success() {
    echo -e "\033[0;32m$1\033[0m"
}

# Function to print an error in red
print_error() {
    echo -e "\033[0;31m$1\033[0m"
}

# Function to make a request with file upload support
make_request() {
    local endpoint=$1
    local data=$2
    local description=$3
    local auth_header=$4
    local content_type=${5:-"application/json"}
    local method=${6:-"POST"}
    local file_field=${7:-""}
    local file_paths=${8:-""}
    local is_multipart=${9:-false}
    
    echo -n "$description... "
    
    # Create a temporary file for the data if provided
    local temp_file=""
    if [ -n "$data" ]; then
        temp_file=$(mktemp)
        echo "$data" > "$temp_file"
    fi
    
    # Build the curl command
    local cmd="curl -s -w \"\n%{http_code}\" -X $method \"$BASE_URL$endpoint\""
    
    # Add headers
    if [ "$is_multipart" = true ]; then
        # For multipart/form-data, let curl set the content-type
        cmd+=" -H \"Content-Type: multipart/form-data\""
    else
        cmd+=" -H \"Content-Type: $content_type\""
    fi
    
    # Add JWT token if provided
    if [ -n "$auth_header" ]; then
        cmd+=" -H \"Authorization: Bearer $auth_header\""
    fi
    
    # Handle data and file upload
    if [ "$is_multipart" = true ]; then
        # For multipart, add data if provided
        if [ -n "$temp_file" ]; then
            cmd+=" -F \"data=@$temp_file;type=application/json\""
        fi
        
        # Add files if provided
        if [ -n "$file_paths" ]; then
            IFS=',' read -ra FILES <<< "$file_paths"
            for file_path in "${FILES[@]}"; do
                if [ -f "$file_path" ]; then
                    cmd+=" -F \"$file_field=@$file_path\""
                fi
            done
        fi
    else
        # For regular JSON
        if [ -n "$temp_file" ]; then
            cmd+=" -d @$temp_file"
        fi
    fi
    
    # Execute the command
    response=$(eval "$cmd" 2>&1)
    local status_code=$(echo "$response" | tail -n1)
    local json_response=$(echo "$response" | head -n -1)
    
    # Clean up temporary file
    if [ -n "$temp_file" ] && [ -f "$temp_file" ]; then
        rm "$temp_file"
    fi
    
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

# Function to update user profile picture with additional images
update_profile_picture() {
    local user_token=$1
    local avatar_path=$2
    shift 2
    local additional_images=("$@")
    
    if [ -z "$user_token" ] || [ ! -f "$avatar_path" ]; then
        return 1
    fi
    
    echo -n "Updating user profile picture... "
    
    # Create a temporary file for the update data
    local temp_file=$(mktemp)
    echo '{}' > "$temp_file"
    
    # Build the curl command with avatar
    local cmd="curl -s -w \"\n%{http_code}\" -X PATCH \"$BASE_URL/users/me\""
    cmd+=" -H \"Authorization: Bearer $user_token\""
    cmd+=" -H \"Content-Type: multipart/form-data\""
    cmd+=" -F \"data=@$temp_file;type=application/json\""
    cmd+=" -F \"avatar=@$avatar_path\""
    
    # Add additional images if provided
    for img_path in "${additional_images[@]}"; do
        if [ -f "$img_path" ]; then
            cmd+=" -F \"files=@$img_path\""
        fi
    done
    
    # Execute the command
    response=$(eval "$cmd")
    local status_code=$(echo "$response" | tail -n1)
    local json_response=$(echo "$response" | head -n -1)
    
    # Clean up
    rm -f "$temp_file"
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        print_success "✅ Success! (Status: $status_code)"
        return 0
    else
        print_error "❌ Failed! (Status: $status_code)"
        echo "Response: $json_response"
        return 1
    fi
}

# Function to update business profile with all fields and images
update_business_picture() {
    local business_token=$1
    local business_type=$2  # 'restaurant', 'hotel', 'cafe', 'hostel'
    local business_name=$3  # Specific business name
    
    if [ -z "$business_token" ]; then
        return 1
    fi
    
    echo -e "\n=== Updating $business_name profile with all fields and images ==="
    
    # Set business details based on the specific business
    local name
    local description
    local location
    local phoneNumber
    local publicEmail
    local businessType
    local averagePrice
    local restaurantType
    local attentionSchedule
    local openingDays
    local hotelType
    local profile_image
    
    case $business_name in
        "La Buena Mesa")
            name="La Buena Mesa"
            description="Un restaurante familiar con los mejores platos de la cocina tradicional"
            location="Av. Corrientes 1234, Buenos Aires"
            phoneNumber="+54 11 1234-5678"
            publicEmail="contacto@labuenamesa.com"
            businessType="RESTAURANT"
            averagePrice='$$'
            restaurantType="Argentino"
            attentionSchedule='{"openingTime":"09:00","closingTime":"23:00"}'
            openingDays='["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]'
            profile_image="sample_images/profile_pictures/restaurant.jpg"
            ;;
        "Hotel Playa Dorada")
            name="Hotel Playa Dorada"
            description="Un hotel de lujo frente al mar con todas las comodidades"
            location="Av. Costanera 2345, Mar del Plata"
            phoneNumber="+54 223 123-4567"
            publicEmail="reservas@hotelplayadorada.com"
            businessType="HOSTING"
            averagePrice='$$$'
            hotelType="Hotel"
            profile_image="sample_images/profile_pictures/hotel.jpg"
            ;;
        "Café del Centro")
            name="Café del Centro"
            description="Un acogedor café en el corazón de la ciudad con especialidades artesanales"
            location="Av. Santa Fe 1234, Buenos Aires"
            phoneNumber="+54 11 9876-5432"
            publicEmail="contacto@cafedelcentro.com"
            businessType="RESTAURANT"
            averagePrice='$'
            restaurantType="Cafe"
            attentionSchedule='{"openingTime":"07:00","closingTime":"20:00"}'
            openingDays='["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]'
            profile_image="sample_images/profile_pictures/cafe.jpeg"
            ;;
        "Hostel Montaña")
            name="Hostel Montaña"
            description="Un hostel ecológico en las montañas con vistas panorámicas"
            location="Ruta 234, San Carlos de Bariloche"
            phoneNumber="+54 294 123-4567"
            publicEmail="info@hostelmontana.com"
            businessType="HOSTING"
            averagePrice='$$'
            hotelType="Hostel"
            profile_image="sample_images/profile_pictures/hostel.jpg"
            ;;
        *)
            echo "❌ Unknown business: $business_name"
            return 1
            ;;
    esac
    
    # Create a temporary file for the update data
    local temp_file=$(mktemp)
    
    # Create the JSON data for the update with properly escaped dollar signs
    if [ "$business_type" = "restaurant" ] || [ "$business_type" = "cafe" ]; then
        cat > "$temp_file" << EOF
{
    "name": "$name",
    "description": "$description",
    "location": "$location",
    "phoneNumber": "$phoneNumber",
    "publicEmail": "$publicEmail",
    "averagePrice": "$averagePrice",
    "restaurantType": "$restaurantType",
    "attentionSchedule": $attentionSchedule,
    "openingDays": $openingDays
}
EOF
    else
        cat > "$temp_file" << EOF
{
    "name": "$name",
    "description": "$description",
    "location": "$location",
    "phoneNumber": "$phoneNumber",
    "publicEmail": "$publicEmail",
    "averagePrice": "$averagePrice",
    "hotelType": "$hotelType"
}
EOF
    fi

    # First update the profile information
    echo -n "Updating profile information... "
    
    # Build the curl command for the main profile update with multipart/form-data
    local curl_cmd=(
        "curl" "-s" "-w" "\n%{http_code}" "-X" "PATCH" "$BASE_URL/users/me"
        "-H" "Authorization: Bearer $business_token"
        "-H" "Content-Type: multipart/form-data"
        "-F" "data=@$temp_file;type=application/json"
    )
    
    # Execute the profile update
    response=$("${curl_cmd[@]}" 2>/dev/null)
    
    status_code=$(echo "$response" | tail -n1)
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        print_success "✅ Profile updated! (Status: $status_code)"
    else
        print_error "❌ Failed to update profile! (Status: $status_code)"
        echo "Response: $(echo "$response" | head -n -1)"
        rm -f "$temp_file"
        return 1
    fi
    
    # Now handle the avatar and additional images in a separate request
    echo -n "Updating profile images... "
    
    # Create a new temp file for the image update (empty JSON)
    echo '{}' > "$temp_file"
    
    # Build the curl command for the image update
    curl_cmd=(
        "curl" "-s" "-w" "\n%{http_code}" "-X" "PATCH" "$BASE_URL/users/me"
        "-H" "Authorization: Bearer $business_token"
        "-H" "Content-Type: multipart/form-data"
        "-F" "data=@$temp_file;type=application/json"
    )
    
    # Add profile picture if it exists
    if [ -f "$profile_image" ]; then
        curl_cmd+=("-F" "avatar=@$profile_image")
    fi
    
    # Add additional business images based on type - only for profile, not for publications
    # Skip adding additional images to keep them only for publications
    
    # Execute the image update
    response=$("${curl_cmd[@]}" 2>/dev/null)
    
    # Clean up temp file
    rm -f "$temp_file"
    
    status_code=$(echo "$response" | tail -n1)
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        print_success "✅ Images updated! (Status: $status_code)"
        return 0
    else
        print_error "❌ Failed to update images! (Status: $status_code)"
        echo "Response: $(echo "$response" | head -n -1)"
        return 1
    fi
}

# Function to add a review with images
add_review_with_image() {
    local publication_id=$1
    local review_data=$2
    local user_token=$3
    local image_paths=$4
    
    echo -n "Adding review... "
    
    # Create a temporary file for the review data
    local temp_file=$(mktemp)
    echo "$review_data" > "$temp_file"
    
    # Build the curl command
    local cmd="curl -s -w \"\n%{http_code}\" -X POST \"$BASE_URL/publications/$publication_id/review\""
    cmd+=" -H \"Authorization: Bearer $user_token\""
    cmd+=" -F \"data=@$temp_file;type=application/json\""
    
    # Add images if provided
    if [ -n "$image_paths" ]; then
        IFS=',' read -ra FILES <<< "$image_paths"
        for file_path in "${FILES[@]}"; do
            if [ -f "$file_path" ]; then
                cmd+=" -F \"files=@$file_path\""
            fi
        done
    fi
    
    # Execute the command
    response=$(eval "$cmd" 2>&1)
    local status_code=$(echo "$response" | tail -n1)
    local json_response=$(echo "$response" | head -n -1)
    
    # Clean up
    rm "$temp_file"
    
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

make_request "/auth/register" '{
    "name": "Café del Centro",
    "email": "contacto@cafedelcentro.com",
    "password": "business123",
    "role": "BUSINESS",
    "businessType": "RESTAURANT"
}' "Registering Café del Centro"

make_request "/auth/register" '{
    "name": "Hostel Montaña Mágica",
    "email": "info@hostelmontana.com",
    "password": "business123",
    "role": "BUSINESS",
    "businessType": "HOTEL"
}' "Registering Hostel Montaña Mágica"


# 2. Login and get tokens
echo -e "\n=== Logging in users to get tokens ==="

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
        
        if [ -n "$token" ]; then
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
login_user "contacto@cafedelcentro.com" "business123" "CAFE_TOKEN"
login_user "info@hostelmontana.com" "business123" "HOSTEL_TOKEN"

# 3. Update profile pictures
echo -e "\n=== Updating Profile Pictures ==="

if [ -f "sample_images/profile_pictures/user1.jpg" ]; then
    update_profile_picture "$USER1_TOKEN" "sample_images/profile_pictures/user1.jpg"
fi

if [ -f "sample_images/profile_pictures/user2.jpg" ]; then
    update_profile_picture "$USER2_TOKEN" "sample_images/profile_pictures/user2.jpg"
fi

# Update business profiles with all fields and images
if [ -n "$RESTAURANT_TOKEN" ]; then
    update_business_picture "$RESTAURANT_TOKEN" "restaurant" "La Buena Mesa"
fi

if [ -n "$HOTEL_TOKEN" ]; then
    update_business_picture "$HOTEL_TOKEN" "hotel" "Hotel Playa Dorada"
fi

if [ -n "$CAFE_TOKEN" ]; then
    update_business_picture "$CAFE_TOKEN" "cafe" "Café del Centro"
fi

if [ -n "$HOSTEL_TOKEN" ]; then
    update_business_picture "$HOSTEL_TOKEN" "hostel" "Hostel Montaña"
fi


# 4. Create publications (only for businesses)
echo -e "\n=== Creating Publications ==="
# Function to create a publication with dynamic images
create_publication() {
    local token=$1
    local business_type=$2
    local index=$3
    local business_name=${4:-""}  # Optional business name parameter
    
    echo -n "Creating $business_type publication $index... "
    
    # Set default values
    local title=""
    local description=""
    local phone=""
    local email=""
    local location=""
    local opening_days='["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]'
    local opening_time="09:00"
    local closing_time="23:00"
    local exceptional_days='[]'
    local tags='[]'
    local image_path=""
    
    if [ "$business_type" = "restaurant" ]; then
        case $index in
            1)
                title="Menú Especial de Otoño"
                description="Disfruta de nuestro menú de temporada con ingredientes frescos y locales."
                phone="+54 11 1234-5678"
                email="reservas@labuenamesa.com"
                location="Av. Corrientes 1234, Buenos Aires"
                opening_time="12:00"
                closing_time="23:00"
                exceptional_days='["2025-12-25", "2026-01-01"]'
                tags='["restaurante", "comida", "menú", "especial"]'
                image_path="sample_images/publications/restaurant/cena1.jpg"
                ;;
            2)
                title="Noche de Vinos"
                description="Degustación de vinos de bodegas locales con maridaje incluido."
                phone="+54 11 1234-5678"
                email="eventos@labuenamesa.com"
                location="Av. Corrientes 1234, Buenos Aires"
                opening_time="20:00"
                closing_time="23:30"
                exceptional_days='[]'
                tags='["vinos", "degustación", "evento"]'
                image_path="sample_images/publications/restaurant/vinos.jpeg"
                ;;
            3)
                title="Brunch de Domingos"
                description="Disfruta de nuestro brunch los domingos de 10:00 a 15:00."
                phone="+54 11 1234-5678"
                email="reservas@labuenamesa.com"
                location="Av. Corrientes 1234, Buenos Aires"
                opening_days='["SUNDAY"]'
                opening_time="10:00"
                closing_time="15:00"
                exceptional_days='[]'
                tags='["brunch", "desayuno", "domingo"]'
                image_path="sample_images/publications/restaurant/postre1.jpg"
                ;;
        esac
    elif [ "$business_type" = "hotel" ]; then
        case $index in
            1)
                title="Escape a la Playa - Oferta Especial"
                description="Disfruta de unas vacaciones inolvidables frente al mar con nuestro paquete todo incluido."
                phone="+54 223 123-4567"
                email="reservas@playadorada.com"
                location="Av. Costanera 2345, Mar del Plata"
                opening_days='["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]'
                opening_time="00:00"
                closing_time="23:59"
                exceptional_days='[]'
                tags='["hotel", "playa", "vacaciones", "todo incluido"]'
                image_path="sample_images/publications/hotel/playa1.jpeg"
                ;;
            2)
                title="Paquete Romántico"
                description="Escapada romántica con cena gourmet y masajes para dos."
                phone="+54 223 123-4567"
                email="romance@playadorada.com"
                location="Av. Costanera 2345, Mar del Plata"
                opening_days='["FRIDAY","SATURDAY"]'
                opening_time="14:00"
                closing_time="23:00"
                exceptional_days='[]'
                tags='["romántico", "parejas", "especial"]'
                image_path="sample_images/publications/hotel/deluxe1.jpeg"
                ;;
            3)
                title="Paquete Familiar"
                description="Diversión para toda la familia con actividades para niños y adultos."
                phone="+54 223 123-4567"
                email="familias@playadorada.com"
                location="Av. Costanera 2345, Mar del Plata"
                opening_days='["SATURDAY","SUNDAY"]'
                opening_time="09:00"
                closing_time="20:00"
                exceptional_days='[]'
                tags='["familiar", "niños", "actividades"]'
                image_path="sample_images/publications/hotel/suite1.jpg"
                ;;
        esac
    elif [ "$business_type" = "cafe" ]; then
        case $index in
            1)
                title="Café de Especialidad"
                description="Disfruta de nuestros cafés de especialidad tostados artesanalmente."
                phone="+54 11 9876-5432"
                email="contacto@cafedelcentro.com"
                location="Av. Santa Fe 1234, Buenos Aires"
                opening_time="07:00"
                closing_time="20:00"
                tags='["café", "especialidad", "tostado"]'
                image_path="sample_images/publications/restaurant/cafe/cafe1.jpg"
                ;;
            2)
                title="Tardes de Té"
                description="Relájate con nuestra selección de tés e infusiones con pastelería casera."
                phone="+54 11 9876-5432"
                email="contacto@cafedelcentro.com"
                location="Av. Santa Fe 1234, Buenos Aires"
                opening_time="15:00"
                closing_time="19:00"
                tags='["té", "infusiones", "pastelería"]'
                image_path="sample_images/publications/restaurant/cafe/cafe2.jpg"
                ;;
        esac
    elif [ "$business_type" = "hostel" ]; then
        case $index in
            1)
                title="Aventura en la Montaña"
                description="Paquete de aventura con caminatas guiadas y alojamiento en la naturaleza."
                phone="+54 294 123-4567"
                email="info@hostelmontana.com"
                location="Ruta 234, San Carlos de Bariloche"
                opening_days='["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]'
                opening_time="00:00"
                closing_time="23:59"
                tags='["aventura", "montaña", "naturaleza"]'
                image_path="sample_images/publications/hotel/habitacion1.jpg"
                ;;
            2)
                title="Escape de Fin de Semana"
                description="Escapada relajante con desayuno incluido y actividades al aire libre."
                phone="+54 294 123-4567"
                email="reservas@hostelmontana.com"
                location="Ruta 234, San Carlos de Bariloche"
                opening_days='["FRIDAY","SATURDAY","SUNDAY"]'
                opening_time="14:00"
                closing_time="12:00"
                tags='["fin de semana", "relax", "naturaleza"]'
                image_path="sample_images/publications/hotel/playa1.jpeg"
                ;;
        esac
    fi

    # Create a temporary file for the JSON data
    local temp_json=$(mktemp)
    cat << EOF > "$temp_json"
{
    "title": "$title",
    "description": "$description",
    "phoneNumber": "$phone",
    "email": "$email",
    "location": "$location",
    "openingDays": $opening_days,
    "attentionSchedule": {
        "openingTime": "$opening_time",
        "closingTime": "$closing_time"
    },
    "exceptionalClosingDays": $exceptional_days,
    "tags": $tags
}
EOF

    # Build the curl command
    local cmd="curl -s -w \"\n%{http_code}\" -X POST \"$BASE_URL/publications/business\""
    cmd+=" -H \"Authorization: Bearer $token\""
    cmd+=" -H \"Content-Type: multipart/form-data\""
    cmd+=" -F \"data=@$temp_json;type=application/json\""
    
    # Add image if it exists
    if [ -f "$image_path" ]; then
        cmd+=" -F \"files=@$image_path\""
    fi

    # Execute the command
    response=$(eval "$cmd")
    local status_code=$(echo "$response" | tail -n1)
    local json_response=$(echo "$response" | head -n -1)
    
    # Clean up
    rm -f "$temp_json"
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo "✅ Success! (Status: $status_code)"
        echo "$json_response"
        return 0
    else
        echo "❌ Failed! (Status: $status_code)"
        echo "Response: $json_response"
        return 1
    fi
}

# Create restaurant publications
if [ -n "$RESTAURANT_TOKEN" ]; then
    # Create 3 restaurant publications using all available restaurant images
    create_publication "$RESTAURANT_TOKEN" "restaurant" 1
    create_publication "$RESTAURANT_TOKEN" "restaurant" 2
    create_publication "$RESTAURANT_TOKEN" "restaurant" 3
fi

# Create cafe publications
if [ -n "$CAFE_TOKEN" ]; then
    # Create 2 cafe publications using all available cafe images
    create_publication "$CAFE_TOKEN" "cafe" 1
    create_publication "$CAFE_TOKEN" "cafe" 2
fi

# Create hostel publications
if [ -n "$HOSTEL_TOKEN" ]; then
    # Create 2 hostel publications using available hotel images
    create_publication "$HOSTEL_TOKEN" "hostel" 1
    create_publication "$HOSTEL_TOKEN" "hostel" 2
fi


# Create hotel publications
if [ -n "$HOTEL_TOKEN" ]; then
    # We have hotel images, create 3 hotel publications
    create_publication "$HOTEL_TOKEN" "hotel" 1
    create_publication "$HOTEL_TOKEN" "hotel" 2
    create_publication "$HOTEL_TOKEN" "hotel" 3
fi

# 5. Create restaurant menus and room packs
echo -e "\n=== Creating Restaurant Menus and Room Packs ==="

# Function to add a menu item with dynamic images and business-specific content
add_menu_item() {
    local token=$1
    local business_name=$2
    local index=$3
    
    local food_name=""
    local description=""
    local price=""
    local image_path=""
    
    case $business_name in
        "La Buena Mesa")
            case $index in
                1)
                    food_name="Milanesa Napolitana"
                    description="Milanesa de carne con salsa de tomate, jamón y queso gratinado. Acompañada con papas fritas."
                    price="3500.0"
                    image_path="sample_images/menu_items/milanesa.jpeg"
                    ;;
                2)
                    food_name="Jugo de Naranja"
                    description="Jugo de Naranja de primera calidad para acompañar la comida."
                    price="700.0"
                    image_path="sample_images/menu_items/bebida.jpg"
                    ;;
                *)
                    echo "❌ Invalid menu item index: $index"
                    return 1
                    ;;
            esac
            ;;
        "Café del Centro")
            case $index in
                1)
                    food_name="Café Especial"
                    description="Café artesanal de granos tostados localmente. Servido con medialuna de manteca."
                    price="1200.0"
                    image_path="sample_images/menu_items/cafe1.jpg"
                    ;;
                2)
                    food_name="Té de Hierbas"
                    description="Mezcla de hierbas aromáticas seleccionadas. Relajante y digestivo."
                    price="1000.0"
                    image_path="sample_images/menu_items/cafe2.jpg"
                    ;;
                *)
                    echo "❌ Invalid menu item index: $index"
                    return 1
                    ;;
            esac
            ;;
        *)
            echo "❌ Unknown business: $business_name"
            return 1
            ;;
    esac
    
    echo -n "Adding $food_name to menu... "
    
    # Create a temporary file for the JSON data
    local temp_json=$(mktemp)
    cat << EOF > "$temp_json"
{
    "foodName": "$food_name",
    "description": "$description",
    "price": $price
}
EOF

    # Build the curl command - using POST to create new items
    local cmd="curl -s -w \"\n%{http_code}\" -X POST \"$BASE_URL/users/me/restaurant\""
    cmd+=" -H \"Authorization: Bearer $token\""
    cmd+=" -H \"Content-Type: multipart/form-data\""
    cmd+=" -F \"data=@$temp_json;type=application/json\""
    
    # Add image if it exists
    if [ -f "$image_path" ]; then
        cmd+=" -F \"files=@$image_path\""
    fi

    # Execute the command
    response=$(eval "$cmd")
    local status_code=$(echo "$response" | tail -n1)
    local json_response=$(echo "$response" | head -n -1)
    
    # Clean up
    rm -f "$temp_json"
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo "✅ Success! (Status: $status_code)"
        echo "$json_response"
        return 0
    else
        echo "❌ Failed! (Status: $status_code)"
        echo "Response: $json_response"
        return 1
    fi
}

# Function to add a room pack with dynamic images and business-specific content
add_room_pack() {
    local token=$1
    local business_name=$2
    local index=$3
    
    local description=""
    local price=""
    local services="[]"
    local image_path=""
    
    case $business_name in
        "Hotel Playa Dorada")
            case $index in
                1)
                    description="Habitación Estándar con Vista al Mar - Habitación doble con vista al mar. Incluye desayuno buffet y acceso a todas las instalaciones del hotel."
                    price="25000.0"
                    services='["desayuno", "wifi", "piscina", "estacionamiento"]'
                    image_path="sample_images/publications/hotel/habitacion1.jpg"
                    ;;
                2)
                    description="Suite Familiar - Amplia suite con sala de estar y cama king size. Ideal para familias o grupos pequeños."
                    price="38000.0"
                    services='["desayuno", "wifi", "piscina", "estacionamiento", "minibar"]'
                    image_path="sample_images/publications/hotel/suite1.jpg"
                    ;;
                3)
                    description="Habitación Deluxe - Lujosa habitación con jacuzzi y vista panorámica. Incluye acceso al spa y desayuno a la habitación."
                    price="45000.0"
                    services='["desayuno", "wifi", "piscina", "estacionamiento", "spa", "minibar"]'
                    image_path="sample_images/publications/hotel/deluxe1.jpeg"
                    ;;
                *)
                    echo "❌ Invalid room pack index: $index"
                    return 1
                    ;;
            esac
            ;;
        "Hostel Montaña")
            case $index in
                1)
                    description="Habitación Compartida 4 Personas - Cama individual en habitación compartida con baño compartido. Ideal para mochileros y grupos jóvenes."
                    price="8000.0"
                    services='["wifi", "cocina_compartida", "area_comun"]'
                    image_path="sample_images/business_picture/hostel1.jpg"
                    ;;
                2)
                    description="Habitación Doble Privada - Habitación privada con cama matrimonial y baño privado. Perfecta para parejas."
                    price="15000.0"
                    services='["wifi", "desayuno_simple", "baño_privado"]'
                    image_path="sample_images/business_picture/hostel2.jpg"
                    ;;
                *)
                    echo "❌ Invalid room pack index: $index"
                    return 1
                    ;;
            esac
            ;;
        *)
            echo "❌ Unknown business: $business_name"
            return 1
            ;;
    esac
    
    echo -n "Adding room pack $index... "
    
    # Create a temporary file for the JSON data
    local temp_json=$(mktemp)
    cat << EOF > "$temp_json"
{
    "description": "$description",
    "price": $price,
    "services": $services,
    "checkInDate": "2025-12-20",
    "checkOutDate": "2025-12-27",
    "numberOfGuests": 2
}
EOF

    # Build the curl command
    local cmd="curl -s -w \"\n%{http_code}\" -X POST \"$BASE_URL/users/me/hosting\""
    cmd+=" -H \"Authorization: Bearer $token\""
    cmd+=" -H \"Content-Type: multipart/form-data\""
    cmd+=" -F \"data=@$temp_json;type=application/json\""
    
    # Add image if it exists
    if [ -f "$image_path" ]; then
        cmd+=" -F \"images=@$image_path\""
    else
        echo -n "[No image] "
    fi

    # Execute the command
    response=$(eval "$cmd")
    local status_code=$(echo "$response" | tail -n1)
    local json_response=$(echo "$response" | head -n -1)
    
    # Clean up
    rm -f "$temp_json"
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo "✅ Success! (Status: $status_code)"
        return 0
    else
        echo "❌ Failed! (Status: $status_code)"
        echo "Response: $json_response"
        return 1
    fi
}

# 6. Add reviews to publications
echo -e "\n=== Adding Reviews to Publications ==="

# Function to add a review with dynamic images
add_review() {
    local publication_id="$1"
    local token="$2"
    local index=$3
    
    local title=""
    local content=""
    local rating=5
    local image_path=""
    
    case $index in
        1)
            title="Excelente experiencia"
            content="¡Excelente comida y servicio! La milanesa estaba deliciosa. Volveré seguro."
            rating=5
            image_path="sample_images/reviews/review.png"
            ;;
        2)
            title="Muy buena experiencia"
            content="Muy buena atención y platos deliciosos. El lugar es acogedor y la relación calidad-precio es excelente."
            rating=4
            ;;
        *)
            echo "❌ Invalid review index: $index"
            return 1
            ;;
    esac
    
    echo -n "Adding review: \"$title\"... "
    
    # Create a temporary file for the JSON data
    local temp_json=$(mktemp)
    cat << EOF > "$temp_json"
{
    "title": "$title",
    "content": "$content",
    "rating": $rating
}
EOF

    # Build the curl command
    local cmd="curl -s -w \"\n%{http_code}\" -X POST \"$BASE_URL/publications/$publication_id/review\""
    cmd+=" -H \"Authorization: Bearer $token\""
    cmd+=" -H \"Content-Type: multipart/form-data\""
    cmd+=" -F \"data=@$temp_json;type=application/json\""
    
    # Add image if it exists
    if [ -f "$image_path" ]; then
        cmd+=" -F \"files=@$image_path\""
    fi

    # Execute the command
    response=$(eval "$cmd")
    local status_code=$(echo "$response" | tail -n1)
    local json_response=$(echo "$response" | head -n -1)
    
    # Clean up
    rm -f "$temp_json"
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo "✅ Success! (Status: $status_code)"
        echo "$json_response"
        return 0
    else
        echo "❌ Failed! (Status: $status_code)"
        echo "Response: $json_response"
        return 1
    fi
}

# Generic function to add reviews for any publication
add_reviews_to_publication() {
    local publication_token="$1"  # Token of the publication owner (to search publications)
    local publication_type="$2"   # For logging purposes
    
    if [ -z "$publication_token" ]; then
        return 0
    fi
    
    echo -n "Getting $publication_type publications... "
    
    response=$(curl -s -X GET "$BASE_URL/publications/mine?page=0&size=50" \
        -H "Authorization: Bearer $publication_token" \
        -H "Content-Type: application/json" \
        -w "\n%{http_code}")
    
    status_code=$(echo "$response" | tail -n1)
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        echo "✅ Found publications"
        
        # Extract publication IDs from paginated response
        publication_ids=$(echo "$response" | head -n -1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        
        if [ -z "$publication_ids" ]; then
            echo "❌ No publications found for $publication_type"
            return 1
        fi
        
        # Count available review images once
        local review_count=0
        if [ -d "sample_images/reviews" ]; then
            review_count=$(find "sample_images/reviews" -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | wc -l)
        fi
        
        # Add reviews to each publication - distribute users across publications
        local publication_index=0
        local user_tokens=("$USER1_TOKEN" "$USER2_TOKEN" "$USER3_TOKEN")
        local user_count=0
        
        # Count available users
        for token in "${user_tokens[@]}"; do
            if [ -n "$token" ]; then
                ((user_count++))
            fi
        done
        
        for publication_id in $publication_ids; do
            ((publication_index++))
            echo "Adding review to publication $publication_index..."
            
            # Assign different users to different publications
            local user_index=$(( (publication_index - 1) % user_count ))
            local review_index=$(( (publication_index - 1) % 2 + 1 )) # Alternate between review 1 and 2
            
            if [ -n "${user_tokens[$user_index]}" ]; then
                add_review "$publication_id" "${user_tokens[$user_index]}" $review_index
            fi
        done
        
        echo "✅ Added reviews to $publication_index publications"
        
    else
        echo "❌ Failed to search $publication_type publications (Status: $status_code)"
        echo "Response: $(echo "$response" | head -n -1)"
        return 1
    fi
}

# 6. Add restaurant menus and room packs
echo -e "\n=== Adding Restaurant Menus and Room Packs ==="

# Add menu items for restaurant
if [ -n "$RESTAURANT_TOKEN" ]; then
    add_menu_item "$RESTAURANT_TOKEN" "La Buena Mesa" 1
    add_menu_item "$RESTAURANT_TOKEN" "La Buena Mesa" 2
fi

# Add menu items for cafe
if [ -n "$CAFE_TOKEN" ]; then
    add_menu_item "$CAFE_TOKEN" "Café del Centro" 1
    add_menu_item "$CAFE_TOKEN" "Café del Centro" 2
fi

# Add room packs for hotel
if [ -n "$HOTEL_TOKEN" ]; then
    add_room_pack "$HOTEL_TOKEN" "Hotel Playa Dorada" 1
    add_room_pack "$HOTEL_TOKEN" "Hotel Playa Dorada" 2
    add_room_pack "$HOTEL_TOKEN" "Hotel Playa Dorada" 3
fi

# Add room packs for hostel
if [ -n "$HOSTEL_TOKEN" ]; then
    add_room_pack "$HOSTEL_TOKEN" "Hostel Montaña" 1
    add_room_pack "$HOSTEL_TOKEN" "Hostel Montaña" 2
fi

# 7. Add reviews to all business types - each type only once
add_reviews_to_publication "$RESTAURANT_TOKEN" "restaurant"
add_reviews_to_publication "$CAFE_TOKEN" "cafe"
add_reviews_to_publication "$HOTEL_TOKEN" "hotel"
add_reviews_to_publication "$HOSTEL_TOKEN" "hostel"

# 7. Add followers between users
echo -e "\n=== Adding Followers ==="

# Function to make a user follow another user
add_follower() {
    local follower_token="$1"
    local user_id_to_follow="$2"
    local follower_name="$3"
    local followed_name="$4"
    
    echo -n "Making $follower_name follow $followed_name... "
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/$user_id_to_follow/follow" \
        -H "Authorization: Bearer $follower_token" \
        -H "Content-Type: application/json")
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        print_success "✅ Success! (Status: $status_code)"
        return 0
    else
        print_error "❌ Failed! (Status: $status_code)"
        echo "Response: $body"
        return 1
    fi
}

# Get user IDs by logging in and extracting from response
# We need to fetch the user profiles to get their IDs
get_user_id_from_profile() {
    local token="$1"    
    
    response=$(curl -s -X GET "$BASE_URL/users/me" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json")
    
    # Extract the ID from the response - try multiple patterns
    user_id=$(echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    
    # If that didn't work, try another pattern
    if [ -z "$user_id" ]; then
        user_id=$(echo "$response" | grep -oP '(?<="id":")[^"]*' | head -1)
    fi
    
    # Try a third pattern: look for "_id" field (MongoDB ID)
    if [ -z "$user_id" ]; then
        user_id=$(echo "$response" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    fi
    
    if [ -n "$user_id" ]; then
        echo "$user_id"
        return 0
    else
        print_error "Could not get user ID from response"
        return 1
    fi
}

# Get user IDs
if [ -n "$USER1_TOKEN" ]; then
    USER1_ID=$(get_user_id_from_profile "$USER1_TOKEN")
    if [ -n "$USER1_ID" ]; then
        print_success "✅ Got User1 ID: $USER1_ID"
    fi
fi

if [ -n "$USER2_TOKEN" ]; then
    USER2_ID=$(get_user_id_from_profile "$USER2_TOKEN")
    if [ -n "$USER2_ID" ]; then
        print_success "✅ Got User2 ID: $USER2_ID"
    fi
fi

if [ -n "$USER3_TOKEN" ]; then
    USER3_ID=$(get_user_id_from_profile "$USER3_TOKEN")
    if [ -n "$USER3_ID" ]; then
        print_success "✅ Got User3 ID: $USER3_ID"
    fi
fi

# Add followers (User1 follows User2 and User3)
if [ -n "$USER1_TOKEN" ] && [ -n "$USER2_ID" ]; then
    add_follower "$USER1_TOKEN" "$USER2_ID" "Juan" "María"
else
    print_error "Skipping: Juan follow María - missing tokens or IDs"
fi

if [ -n "$USER1_TOKEN" ] && [ -n "$USER3_ID" ]; then
    add_follower "$USER1_TOKEN" "$USER3_ID" "Juan" "Carlos"
else
    print_error "Skipping: Juan follow Carlos - missing tokens or IDs"
fi

# Add followers (User2 follows User1)
if [ -n "$USER2_TOKEN" ] && [ -n "$USER1_ID" ]; then
    add_follower "$USER2_TOKEN" "$USER1_ID" "María" "Juan"
else
    print_error "Skipping: María follow Juan - missing tokens or IDs"
fi

# Add followers (User3 follows User1 and User2)
if [ -n "$USER3_TOKEN" ] && [ -n "$USER1_ID" ]; then
    add_follower "$USER3_TOKEN" "$USER1_ID" "Carlos" "Juan"
else
    print_error "Skipping: Carlos follow Juan - missing tokens or IDs"
fi

if [ -n "$USER3_TOKEN" ] && [ -n "$USER2_ID" ]; then
    add_follower "$USER3_TOKEN" "$USER2_ID" "Carlos" "María"
else
    print_error "Skipping: Carlos follow María - missing tokens or IDs"
fi

# 8. Add likes to publications
echo -e "\n=== Adding Likes to Publications ==="

# Function to add a like to a publication
add_like_to_publication() {
    local user_token="$1"
    local publication_id="$2"
    local user_name="$3"
    
    echo -n "Adding like from $user_name to publication... "
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/publications/$publication_id/like" \
        -H "Authorization: Bearer $user_token" \
        -H "Content-Type: application/json")
    
    status_code=$(echo "$response" | tail -n1)
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        print_success "✅ Success! (Status: $status_code)"
        return 0
    else
        print_error "❌ Failed! (Status: $status_code)"
        echo "Response: $(echo "$response" | head -n -1)"
        return 1
    fi
}

# Get all publications
if [ -n "$USER1_TOKEN" ]; then
    echo -n "Fetching publications for adding likes... "
    
    response=$(curl -s -X GET "$BASE_URL/publications/search" \
        -H "Authorization: Bearer $USER1_TOKEN" \
        -H "Content-Type: application/json")
    
    # Extract all publication IDs
    pub_ids=($(echo "$response" | grep -o '"id":"[^"]*' | cut -d'"' -f4))
    
    if [ ${#pub_ids[@]} -gt 0 ]; then
        print_success "✅ Found ${#pub_ids[@]} publication(s)"
        
        # Add likes from different users to each publication (max 2 likes per publication)
        counter=0
        for pub_id in "${pub_ids[@]}"; do
            # User1 likes the publication
            if [ -n "$USER1_TOKEN" ]; then
                add_like_to_publication "$USER1_TOKEN" "$pub_id" "Juan"
            fi
            
            # User2 likes the publication (only for some publications to vary)
            if [ -n "$USER2_TOKEN" ] && [ $(($counter % 2)) -eq 0 ]; then
                add_like_to_publication "$USER2_TOKEN" "$pub_id" "María"
            fi
            
            counter=$((counter + 1))
        done
    else
        print_error "❌ No publications found"
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