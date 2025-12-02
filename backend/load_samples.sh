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
    local business_picture=$4  # Comma-separated list of account images
    
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
            location='{"address": "Av. Corrientes 1234, Buenos Aires", "latitude": -34.6037, "longitude": -58.3816}'
            phoneNumber="+54 11 1234-5678"
            publicEmail="contacto@labuenamesa.com"
            businessType="RESTAURANT"
            averagePrice='$$'
            restaurantType="Argentino"
            attentionSchedule='{"openingTime":"09:00","closingTime":"23:00"}'
            openingDays='["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]'
            profile_image="sample_images/profile_pictures/restaurant.jpg"
            ;;
        "Brisa Marina")
            name="Brisa Marina"
            description="Experiencia gastronómica gourmet frente al mar donde cada plato cuenta una historia"
            location='{"address": "Av. Costanera 1234, Mar del Plata", "latitude": -38.0176, "longitude": -57.5367}'
            phoneNumber="+54 223 412-3456"
            publicEmail="contacto@brisamarina.com"
            businessType="RESTAURANT"
            averagePrice='$$$'
            restaurantType="Argentino"
            attentionSchedule='{"openingTime":"12:00","closingTime":"23:00"}'
            openingDays='["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]'
            profile_image="sample_images/profile_pictures/seafood.jpg"
            ;;
        "Sabores Peruanos")
            name="Sabores Peruanos"
            description="Auténtica cocina peruana con ingredientes frescos y sabores tradicionales"
            location='{"address": "Av. Cabildo 2345, CABA", "latitude": -34.5607, "longitude": -58.4566}'
            phoneNumber="+54 11 4783-2198"
            publicEmail="reservas@saboresperuanos.com"
            businessType="RESTAURANT"
            averagePrice='$$'
            restaurantType="Peruano"
            attentionSchedule='{"openingTime":"11:30","closingTime":"23:30"}'
            openingDays='["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]'
            profile_image="sample_images/profile_pictures/peru1.png"
            ;;
        "El Encuentro Hostel")
            name="El Encuentro Hostel"
            description="Espacio para viajeros jóvenes que buscan conectar con otros aventureros"
            location='{"address": "Av. San Martín 876, Bariloche", "latitude": -41.1335, "longitude": -71.3103}'
            phoneNumber="+54 294 415-6789"
            publicEmail="info@elencuentrohostel.com"
            businessType="HOTEL"
            averagePrice='$'
            hotelType="Hostel"
            attentionSchedule='{"checkInTime":"14:00","checkOutTime":"10:00"}'
            profile_image="sample_images/profile_pictures/encuentro1.png"
            ;;
        "Hotel Playa Dorada")
            name="Hotel Playa Dorada"
            description="Un hotel de lujo frente al mar con todas las comodidades"
            location='{"address": "Av. Costanera 2345, Mar del Plata", "latitude": -38.0055, "longitude": -57.5426}'
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
            location='{"address": "Av. Santa Fe 1234, Buenos Aires", "latitude": -34.5895, "longitude": -58.3816}'
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
            name="Hostel Montaña Mágica"
            description="Un hostel ecológico en las montañas con vistas panorámicas"
            location='{"address": "Ruta 234, San Carlos de Bariloche", "latitude": -41.1335, "longitude": -71.3103}'
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
    
    # Create the JSON data for the update
    if [ "$business_type" = "restaurant" ] || [ "$business_type" = "cafe" ]; then
        cat > "$temp_file" << EOF
{
    "name": "$(echo "$name" | sed 's/"/\\"/g')",
    "description": "$(echo "$description" | sed 's/"/\\"/g')",
    "location": $location,
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
    "name": "$(echo "$name" | sed 's/"/\\"/g')",
    "description": "$(echo "$description" | sed 's/"/\\"/g')",
    "location": $location,
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
    
    # Add profile picture to avatar field if it exists
    if [ -f "$profile_image" ]; then
        curl_cmd+=("-F" "avatar=@$profile_image")
    fi
    
    # Add account images to files array if they exist
    if [ -n "$business_picture" ]; then
        IFS=',' read -ra IMAGES <<< "$business_picture"
        for img in "${IMAGES[@]}"; do
            if [ -f "$img" ]; then
                curl_cmd+=("-F" "files=@$img")
            else
                print_error "Account image not found: $img"
            fi
        done
    fi
    
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
    "name": "Camila",
    "email": "camila@example.com",
    "password": "password123",
    "role": "USER"
}' "Registering Camila"

make_request "/auth/register" '{
    "name": "Luisito Villar",
    "email": "luisito@example.com",
    "password": "password123",
    "role": "USER"
}' "Registering Luisito Villar"

make_request "/auth/register" '{
    "name": "Julián Álvarez",
    "email": "julian@example.com",
    "password": "password123",
    "role": "USER"
}' "Registering Julián Álvarez"

make_request "/auth/register" '{
    "name": "José Luis García",
    "email": "joseluis@example.com",
    "password": "password123",
    "role": "USER"
}' "Registering José Luis García"

make_request "/auth/register" '{
    "name": "Ricardo Mendoza",
    "email": "ricardo@example.com",
    "password": "password123",
    "role": "USER"
}' "Registering Ricardo Mendoza"

make_request "/auth/register" '{
    "name": "Astrid Cornejo",
    "email": "astrid@example.com",
    "password": "password123",
    "role": "USER"
}' "Registering Astrid Cornejo"

make_request "/auth/register" '{
    "name": "Aizen Martínez",
    "email": "aizen@example.com",
    "password": "password123",
    "role": "USER"
}' "Registering Aizen Martínez"

# Register Business Accounts
# Original businesses
make_request "/auth/register" '{
    "name": "Restaurante La Buena Mesa",
    "email": "info@labuenamesa.com",
    "password": "business123",
    "role": "BUSINESS",
    "businessType": "RESTAURANT"
}' "Registering Restaurant Business"

make_request "/auth/register" '{
    "name": "Hotel Playa Dorada",
    "email": "anibalfu2005@gmail.com",
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

# New Business Accounts
# 1. Isabel Montenegro - Brisa Marina (Gourmet restaurant by the sea)
make_request "/auth/register" '{
    "name": "Brisa Marina",
    "email": "isabel@brisamarina.com",
    "password": "business123",
    "role": "BUSINESS",
    "businessType": "RESTAURANT"
}' "Registering Brisa Marina Restaurant"

# 2. Gastón Acurio - Peruvian Cuisine Restaurant
make_request "/auth/register" '{
    "name": "Sabores Peruanos",
    "email": "afu@fi.uba.ar",
    "password": "business123",
    "role": "BUSINESS",
    "businessType": "RESTAURANT"
}' "Registering Sabores Peruanos Restaurant"

# 3. Diego Morales - Youth Hostel
make_request "/auth/register" '{
    "name": "El Encuentro Hostel",
    "email": "diego@elencuentrohostel.com",
    "password": "business123",
    "role": "BUSINESS",
    "businessType": "HOTEL"
}' "Registering El Encuentro Hostel"

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
# Regular users
login_user "camila@example.com" "password123" "USER1_TOKEN"
login_user "luisito@example.com" "password123" "USER2_TOKEN"
login_user "julian@example.com" "password123" "USER3_TOKEN"
login_user "joseluis@example.com" "password123" "USER4_TOKEN"
login_user "ricardo@example.com" "password123" "USER5_TOKEN"
login_user "astrid@example.com" "password123" "USER6_TOKEN"
login_user "aizen@example.com" "password123" "USER7_TOKEN"

# Original business accounts
login_user "info@labuenamesa.com" "business123" "RESTAURANT_TOKEN"
login_user "anibalfu2005@gmail.com" "business123" "HOTEL_TOKEN"
login_user "contacto@cafedelcentro.com" "business123" "CAFE_TOKEN"
login_user "info@hostelmontana.com" "business123" "HOSTEL_TOKEN"

# New business accounts
login_user "isabel@brisamarina.com" "business123" "BRISAMARINA_TOKEN"
login_user "afu@fi.uba.ar" "business123" "SABORESPERU_TOKEN"
login_user "diego@elencuentrohostel.com" "business123" "ELENCUENTRO_TOKEN"

# 3. Update profile pictures
echo -e "\n=== Updating Profile Pictures ==="

if [ -f "sample_images/profile_pictures/user1.png" ]; then
    update_profile_picture "$USER1_TOKEN" "sample_images/profile_pictures/user1.png"
fi

if [ -f "sample_images/profile_pictures/user2.png" ]; then
    update_profile_picture "$USER2_TOKEN" "sample_images/profile_pictures/user2.png"
fi
if [ -f "sample_images/profile_pictures/user3.png" ]; then
    update_profile_picture "$USER3_TOKEN" "sample_images/profile_pictures/user3.png"
fi

if [ -f "sample_images/profile_pictures/user4.png" ]; then
    update_profile_picture "$USER4_TOKEN" "sample_images/profile_pictures/user4.png"
fi

if [ -f "sample_images/profile_pictures/user5.png" ]; then
    update_profile_picture "$USER5_TOKEN" "sample_images/profile_pictures/user5.png"
fi

if [ -f "sample_images/profile_pictures/user6.png" ]; then
    update_profile_picture "$USER6_TOKEN" "sample_images/profile_pictures/user6.png"
fi

if [ -f "sample_images/profile_pictures/user7.png" ]; then
    update_profile_picture "$USER7_TOKEN" "sample_images/profile_pictures/user7.png"
fi
# Update business profiles with all fields and images
if [ -n "$RESTAURANT_TOKEN" ]; then
    update_business_picture "$RESTAURANT_TOKEN" "restaurant" "La Buena Mesa" "sample_images/business_picture/restaurant2.jpg,sample_images/business_picture/resto5.jpg"
fi

if [ -n "$HOTEL_TOKEN" ]; then
    update_business_picture "$HOTEL_TOKEN" "hotel" "Hotel Playa Dorada" "sample_images/business_picture/playa1.jpeg,sample_images/business_picture/hostel1.jpg,sample_images/business_picture/hostel2.jpg"
fi

if [ -n "$CAFE_TOKEN" ]; then
    update_business_picture "$CAFE_TOKEN" "cafe" "Café del Centro" "sample_images/business_picture/cafe1.jpg,sample_images/business_picture/cafe2.jpg"
fi

if [ -n "$HOSTEL_TOKEN" ]; then
    update_business_picture "$HOSTEL_TOKEN" "hostel" "Hostel Montaña" "sample_images/business_picture/hotel1.jpg"
fi

# Update new business profiles with all fields and images
if [ -n "$BRISAMARINA_TOKEN" ]; then
    update_business_picture "$BRISAMARINA_TOKEN" "restaurant" "Brisa Marina" "sample_images/business_picture/brisa1.jpeg,sample_images/business_picture/brisa2.jpg"
fi

if [ -n "$SABORESPERU_TOKEN" ]; then
    update_business_picture "$SABORESPERU_TOKEN" "restaurant" "Sabores Peruanos" "sample_images/business_picture/peru1.jpg"
fi

if [ -n "$ELENCUENTRO_TOKEN" ]; then
    update_business_picture "$ELENCUENTRO_TOKEN" "hotel" "El Encuentro Hostel" "sample_images/business_picture/encuentro1.jpg"
fi


# 4. Create publications (only for businesses)
echo -e "\n=== Creating Publications ==="
# Function to create a publication with dynamic images
create_publication() {
    local token=$1
    local business_type=$2
    local index=$3
    local business_name=${4:-""}  # Business name parameter is now required
    
    echo -n "Creating publication for $business_name - $index... "
    
    # Set default values
    local title=""
    local description=""
    local phone=""
    local email=""
    local location='null'
    local opening_days='["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]'
    local opening_time="09:00"
    local closing_time="23:00"
    local exceptional_days='[]'
    local tags='[]'
    local image_path=""
    
    # Set business-specific details based on business name
    case $business_name in
        "La Buena Mesa")
            case $index in
                1)
                    title="Menú Especial de Otoño"
                    description="Disfruta de nuestro menú de temporada con ingredientes frescos y locales en La Buena Mesa."
                    phone="+54 11 1234-5678"
                    email="reservas@labuenamesa.com"
                    location='{"address":"Av. Corrientes 1234, Buenos Aires","latitude":-34.6037,"longitude":-58.3816}'
                    opening_time="12:00"
                    closing_time="23:00"
                    tags='["restaurante", "comida", "menú", "especial"]'
                    image_path="sample_images/publications/restaurant/cena1.jpg"
                    ;;
                2)
                    title="Noche de Vinos"
                    description="Degustación de vinos de bodegas locales con maridaje exclusivo en La Buena Mesa."
                    phone="+54 11 1234-5678"
                    email="reservas@labuenamesa.com"
                    location='{"address":"Av. Corrientes 1234, Buenos Aires","latitude":-34.6037,"longitude":-58.3816}'
                    opening_time="20:00"
                    closing_time="23:30"
                    tags='["vinos", "degustación", "evento"]'
                    image_path="sample_images/publications/restaurant/vinos.jpeg"
                    ;;
                3)
                    title="Brunch de Domingos"
                    description="Disfruta de nuestro exclusivo brunch los domingos en La Buena Mesa."
                    opening_days='["SUNDAY"]'
                    phone="+54 11 1234-5678"
                    email="reservas@labuenamesa.com"
                    location='{"address":"Av. Corrientes 1234, Buenos Aires","latitude":-34.6037,"longitude":-58.3816}'
                    opening_time="10:00"
                    closing_time="15:00"
                    tags='["brunch", "desayuno", "domingo"]'
                    image_path="sample_images/publications/restaurant/postre1.jpg"
                    ;;
            esac
            ;;
            
        "Café del Centro")
            case $index in
                1)
                    title="Café de Especialidad"
                    description="Disfruta de nuestros cafés de especialidad tostados artesanalmente en Café del Centro."
                    phone="+54 11 9876-5432"
                    email="contacto@cafedelcentro.com"
                    location='{"address":"Av. Santa Fe 1234, Buenos Aires","latitude":-34.5895,"longitude":-58.3816}'
                    opening_time="07:00"
                    closing_time="20:00"
                    tags='["café", "especialidad", "tostado"]'
                    image_path="sample_images/publications/restaurant/cafe/cafe1.jpg"
                    ;;
                2)
                    title="Tardes de Té"
                    description="Relájate con nuestra selección de tés e infusiones con pastelería casera en Café del Centro."
                    phone="+54 11 9876-5432"
                    email="contacto@cafedelcentro.com"
                    location='{"address":"Av. Santa Fe 1234, Buenos Aires","latitude":-34.5895,"longitude":-58.3816}'
                    opening_time="15:00"
                    closing_time="19:00"
                    tags='["té", "infusiones", "pastelería"]'
                    image_path="sample_images/publications/restaurant/cafe/cafe2.jpg"
                    ;;
            esac
            ;;
            
        "Hostel Montaña")
            case $index in
                1)
                    title="Aventura en la Montaña"
                    description="Paquete de aventura con caminatas guiadas y alojamiento en la naturaleza en Hostel Montaña."
                    phone="+54 294 123-4567"
                    email="info@hostelmontana.com"
                    location='{"address":"Ruta 234, San Carlos de Bariloche","latitude":-41.1335,"longitude":-71.3103}'
                    tags='["aventura", "montaña", "naturaleza"]'
                    image_path="sample_images/publications/hotel/habitacion1.jpg"
                    ;;
                2)
                    title="Escape de Fin de Semana"
                    description="Escapada relajante con desayuno incluido y actividades al aire libre en Hostel Montaña."
                    phone="+54 294 123-4567"
                    email="info@hostelmontana.com"
                    location='{"address":"Ruta 234, San Carlos de Bariloche","latitude":-41.1335,"longitude":-71.3103}'
                    opening_days='["FRIDAY","SATURDAY","SUNDAY"]'
                    opening_time="14:00"
                    closing_time="12:00"
                    tags='["fin de semana", "relax", "naturaleza"]'
                    image_path="sample_images/publications/hotel/aventura1.jpg"
                    ;;
            esac
            ;;
            
        "Hotel Playa Dorada")
            case $index in
                1)
                    title="Escape a la Playa - Oferta Especial"
                    description="Disfruta de unas vacaciones inolvidables frente al mar con nuestro paquete todo incluido en Hotel Playa Dorada."
                    phone="+54 223 123-4567"
                    email="anibalfu2005@gmail.com"
                    location='{"address":"Av. Costanera 2345, Mar del Plata","latitude":-38.0055,"longitude":-57.5426}'
                    tags='["hotel", "playa", "vacaciones", "todo incluido"]'
                    image_path="sample_images/publications/hotel/playa1.jpeg"
                    ;;
                2)
                    title="Paquete Romántico"
                    description="Escapada romántica con cena gourmet y masajes para dos en Hotel Playa Dorada."
                    phone="+54 223 123-4567"
                    email="anibalfu2005@gmail.com"
                    location='{"address":"Av. Costanera 2345, Mar del Plata","latitude":-38.0055,"longitude":-57.5426}'
                    opening_days='["FRIDAY","SATURDAY"]'
                    opening_time="14:00"
                    closing_time="23:00"
                    tags='["romántico", "parejas", "especial"]'
                    image_path="sample_images/publications/hotel/deluxe1.jpeg"
                    ;;
                3)
                    title="Paquete Familiar"
                    description="Diversión para toda la familia con actividades para niños y adultos en Hotel Playa Dorada."
                    phone="+54 223 123-4567"
                    email="anibalfu2005@gmail.com"
                    location='{"address":"Av. Costanera 2345, Mar del Plata","latitude":-38.0055,"longitude":-57.5426}'
                    opening_days='["SATURDAY","SUNDAY"]'
                    opening_time="09:00"
                    closing_time="20:00"
                    tags='["familiar", "niños", "actividades"]'
                    image_path="sample_images/publications/hotel/suite1.jpg"
                    ;;
            esac
            ;;
            
        "Brisa Marina")
            case $index in
                1)
                    title="Menú Degustación de Mariscos"
                    description="Disfruta de una experiencia gastronómica única con los mejores frutos del mar en Brisa Marina."
                    phone="+54 223 456-7890"
                    email="reservas@brisamarina.com"
                    location='{"address":"Av. Costanera 1234, Mar del Plata","latitude":-38.0055,"longitude":-57.5426}'
                    opening_time="12:30"
                    closing_time="23:00"
                    tags='["mariscos", "gourmet", "vista al mar"]'
                    image_path="sample_images/publications/restaurant/mariscos1.jpeg"
                    ;;
                2)
                    title="Cena con Vista al Atardecer"
                    description="Vive una experiencia inolvidable con nuestra cena de 5 pasos mientras el sol se pone en el mar."
                    phone="+54 223 456-7890"
                    email="reservas@brisamarina.com"
                    location='{"address":"Av. Costanera 1234, Mar del Plata","latitude":-38.0055,"longitude":-57.5426}'
                    opening_time="19:00"
                    closing_time="23:30"
                    tags='["romántico", "vista al mar", "cena gourmet"]'
                    image_path="sample_images/publications/restaurant/atardecer1.jpeg"
                    ;;
            esac
            ;;
            
        "Sabores Peruanos")
            case $index in
                1)
                    title="Especialidad: Ceviche Tradicional"
                    description="Prueba nuestro auténtico ceviche peruano preparado con pescado fresco y los mejores ingredientes."
                    phone="+54 11 4567-8901"
                    email="contacto@saboresperuanos.com"
                    location='{"address":"Av. Cabildo 2345, CABA","latitude":-34.5607,"longitude":-58.4566}'
                    opening_time="12:00"
                    closing_time="23:30"
                    tags='["ceviche", "comida peruana", "especialidad"]'
                    image_path="sample_images/publications/restaurant/ceviche1.jpg"
                    ;;
                2)
                    title="Noche de Pisco Sour"
                    description="Disfruta de una noche de cócteles peruanos con música en vivo y tapas andinas."
                    phone="+54 11 4567-8901"
                    email="contacto@saboresperuanos.com"
                    location='{"address":"Av. Cabildo 2345, CABA","latitude":-34.5607,"longitude":-58.4566}'
                    opening_days='["FRIDAY","SATURDAY"]'
                    opening_time="20:00"
                    closing_time="01:00"
                    tags='["pisco", "cócteles", "música en vivo"]'
                    image_path="sample_images/publications/restaurant/pisco1.jpg"
                    ;;
            esac
            ;;
            
        "El Encuentro Hostel")
            case $index in
                1)
                    title="Paquete Aventurero"
                    description="Para los viajeros que buscan acción, incluye alojamiento, desayuno y actividades de aventura."
                    phone="+54 294 567-8901"
                    email="aventura@elencuentrohostel.com"
                    location='{"address":"Ruta 40 km 2015, San Carlos de Bariloche","latitude":-41.1335,"longitude":-71.3103}'
                    tags='["aventura", "montañismo", "excursiones"]'
                    image_path="sample_images/publications/hotel/aventura2.jpg"
                    ;;
                2)
                    title="Noche de Viajeros"
                    description="Conoce viajeros de todo el mundo en nuestra tradicional noche de intercambio de historias."
                    phone="+54 294 567-8901"
                    email="aventura@elencuentrohostel.com"
                    location='{"address":"Ruta 40 km 2015, San Carlos de Bariloche","latitude":-41.1335,"longitude":-71.3103}'
                    opening_days='["THURSDAY"]'
                    opening_time="21:00"
                    closing_time="01:00"
                    tags='["social", "viajeros", "intercambio"]'
                    image_path="sample_images/publications/hotel/social1.jpg"
                    ;;
            esac
            ;;
            
        *)
            # Default case for any business not explicitly listed
            title="Publicación Especial $index"
            description="Disfruta de nuestras ofertas especiales en $business_name."
            phone="+54 11 0000-0000"
            email="contacto@${business_name// /}.com"
            tags='["especial"]'
            ;;
    esac
    
    # Set default values if not set by business type
    : ${title:="Publicación $index"}
    : ${description:="Disfruta de nuestras ofertas especiales."}
    : ${phone:="+54 11 0000-0000"}
    : ${email:="contacto@${business_name// /}.com"}
    : ${location:='null'}
    : ${opening_days:='["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]'}
    : ${opening_time:="09:00"}
    : ${closing_time:="23:00"}
    : ${exceptional_days:='[]'}
    : ${tags:='["especial"]'}

    # Create a temporary file for the JSON data
    local temp_json=$(mktemp)
    # Create a temporary file with properly formatted JSON
    cat > "$temp_json" << EOF
{
    "title": "$(echo "$title" | sed 's/"/\\"/g')",
    "description": "$(echo "$description" | sed 's/"/\\"/g')",
    "phoneNumber": "$phone",
    "email": "$email",
    "location": $location,
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
       echo "✅ Success - Status: $status_code"
       echo "Response: $json_response"
       return 0
    else
       echo "❌ Failed - Status: $status_code"
       echo "Response: $json_response"
        return 1
    fi
}

# Create publications for each business with unique content
if [ -n "$RESTAURANT_TOKEN" ]; then
    # La Buena Mesa
    create_publication "$RESTAURANT_TOKEN" "restaurant" 1 "La Buena Mesa"
    create_publication "$RESTAURANT_TOKEN" "restaurant" 2 "La Buena Mesa"
    create_publication "$RESTAURANT_TOKEN" "restaurant" 3 "La Buena Mesa"
fi

if [ -n "$CAFE_TOKEN" ]; then
    # Café del Centro
    create_publication "$CAFE_TOKEN" "cafe" 1 "Café del Centro"
    create_publication "$CAFE_TOKEN" "cafe" 2 "Café del Centro"
fi

if [ -n "$HOSTEL_TOKEN" ]; then
    # Hostel Montaña
    create_publication "$HOSTEL_TOKEN" "hostel" 1 "Hostel Montaña"
    create_publication "$HOSTEL_TOKEN" "hostel" 2 "Hostel Montaña"
fi

if [ -n "$HOTEL_TOKEN" ]; then
    # Hotel Playa Dorada
    create_publication "$HOTEL_TOKEN" "hotel" 1 "Hotel Playa Dorada"
    create_publication "$HOTEL_TOKEN" "hotel" 2 "Hotel Playa Dorada"
    create_publication "$HOTEL_TOKEN" "hotel" 3 "Hotel Playa Dorada"
fi

if [ -n "$BRISAMARINA_TOKEN" ]; then
    # Brisa Marina
    create_publication "$BRISAMARINA_TOKEN" "restaurant" 1 "Brisa Marina"
    create_publication "$BRISAMARINA_TOKEN" "restaurant" 2 "Brisa Marina"
fi

if [ -n "$SABORESPERU_TOKEN" ]; then
    # Sabores Peruanos
    create_publication "$SABORESPERU_TOKEN" "restaurant" 1 "Sabores Peruanos"
    create_publication "$SABORESPERU_TOKEN" "restaurant" 2 "Sabores Peruanos"
fi

if [ -n "$ELENCUENTRO_TOKEN" ]; then
    # El Encuentro Hostel
    create_publication "$ELENCUENTRO_TOKEN" "hostel" 1 "El Encuentro Hostel"
    create_publication "$ELENCUENTRO_TOKEN" "hostel" 2 "El Encuentro Hostel"
fi

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

# Function to add a review with dynamic images
add_review() {
    local publication_id="$1"
    local token="$2"
    local index=$3
    local business_type="$4"  # restaurant, hotel, cafe, hostel
    
    local title=""
    local content=""
    local rating=5
    
    # Generate a random rating between 3-5 for positive reviews, 1-2 for negative ones
    if [ $((RANDOM % 10)) -lt 2 ]; then  # 20% chance of negative review
        rating=$((1 + RANDOM % 2))
    else
        rating=$((3 + RANDOM % 3))
    fi
    
    # Reviews specific to business type
    case $business_type in
        "restaurant")
            case $index in
                1)
                    title="Excelente experiencia"
                    content="¡Excelente comida y servicio! Estaba todo delicioso. Volveré seguro."
                    rating=5
                    ;;
                2)
                    title="Excelente relación calidad-precio"
                    content="Comida casera abundante y sabrosa. Las pastas son caseras y los postres caseros. Muy recomendable el tiramisú."
                    rating=4
                    ;;
                3)
                    title="Buena opción para comer"
                    content="El lugar es acogedor y la comida está bien. No es nada del otro mundo pero cumple con lo que ofrece. El servicio fue rápido."
                    rating=3
                    ;;
                *)
                    echo "❌ Índice de reseña inválido para restaurante: $index"
                    return 1
                    ;;
            esac
            ;;
            
        "hotel")
            case $index in
                1)
                    title="Excelente estadía frente al mar"
                    content="Las habitaciones son amplias y con vista al mar. El desayuno buffet es variado y delicioso. La piscina está impecable."
                    rating=5
                    ;;
                2)
                    title="Buen hotel pero con detalles"
                    content="La ubicación es perfecta, justo frente a la playa. Las habitaciones son cómodas aunque un poco ruidosas. El personal es muy atento."
                    rating=4
                    ;;
                *)
                    echo "❌ Índice de reseña inválido para hotel: $index"
                    return 1
                    ;;
            esac
            ;;
            
        "cafe")
            case $index in
                1)
                    title="El mejor café de la zona"
                    content="Excelente lugar para trabajar o encontrarse con amigos. El café de especialidad es increíble y los medialunas calentitas. WiFi rápido y buen ambiente."
                    rating=5
                    ;;
                2)
                    title="Lindo lugar pero caro"
                    content="El ambiente es acogedor pero los precios son un poco elevados para lo que ofrecen. Los postres están buenos pero no justifican el precio."
                    rating=3
                    ;;
                *)
                    echo "❌ Índice de reseña inválido para café: $index"
                    return 1
                    ;;
            esac
            ;;
            
        "hostel")
            case $index in
                1)
                    title="Excelente relación calidad-precio"
                    content="Muy buen hostel para mochileros. Las habitaciones compartidas son limpias y los baños están impecables. El personal es muy amable y organizan buenas actividades."
                    rating=5
                    ;;
                2)
                    title="Buen ambiente viajero"
                    content="El lugar tiene muy buena onda y es fácil conocer gente. Las instalaciones son básicas pero limpias. La cocina está bien equipada."
                    rating=4
                    ;;
                *)
                    echo "❌ Índice de reseña inválido para hostel: $index"
                    return 1
                    ;;
            esac
            ;;
            
        *)
            echo "❌ Tipo de negocio no reconocido: $business_type"
            return 1
            ;;
    esac
    
    echo -n "Adding review: \"$title\" (Rating: $rating/5)... "
    
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

# Function to add reviews to publications
add_reviews_to_publication() {
    local business_token="$1"
    local business_type="$2"
    
    if [ -z "$business_token" ]; then
        echo "❌ No token provided for $business_type"
        return 1
    fi
    
    # Skip Sabores Peruanos
    if [ "$business_token" = "$SABORESPERU_TOKEN" ]; then
        echo -e "\n=== Skipping reviews for Sabores Peruanos ==="
        return 0
    fi
    
    echo -e "\n=== Adding reviews for $business_type ==="
    
    # Get all publications for this business
    echo -n "Fetching $business_type publications... "
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/publications/mine" \
        -H "Authorization: Bearer $business_token" \
        -H "Content-Type: application/json")
    
    status_code=$(echo "$response" | tail -n1)
    json_response=$(echo "$response" | head -n -1)
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        # Extract publication IDs using grep and cut
        publication_ids=($(echo "$json_response" | grep -o '"id":"[^"]*' | cut -d'"' -f4))
        echo "✅ Found ${#publication_ids[@]} publications"
        
        if [ ${#publication_ids[@]} -eq 0 ]; then
            echo "❌ No publications found for $business_type"
            return 1
        fi
        
        # Get available users
        local users=()
        [ -n "$USER1_TOKEN" ] && users+=("$USER1_TOKEN")
        [ -n "$USER2_TOKEN" ] && users+=("$USER2_TOKEN")
        [ -n "$USER3_TOKEN" ] && users+=("$USER3_TOKEN")
        [ -n "$USER4_TOKEN" ] && users+=("$USER4_TOKEN")
        
        if [ ${#users[@]} -eq 0 ]; then
            echo "❌ No users available to post reviews"
            return 1
        fi
        
        local total_reviews_added=0

        for pub_id in "${publication_ids[@]}"; do
            echo -e "\nProcessing publication $pub_id"
            
            # Shuffle users for this publication
            local shuffled_users=($(shuf -e "${users[@]}"))
            
            # Número aleatorio de reseñas (1-3)
            local num_reviews=$((1 + RANDOM % 3))
            
            # Asegurar que no excedamos los usuarios disponibles
            if [ $num_reviews -gt ${#shuffled_users[@]} ]; then
                num_reviews=${#shuffled_users[@]}
            fi
            
            # Asegurar que al menos 1 reseña
            if [ $num_reviews -lt 1 ]; then
                num_reviews=1
            fi
            
            for ((i=0; i<num_reviews && i<${#shuffled_users[@]}; i++)); do
                local user_token="${shuffled_users[$i]}"
                local review_index=$((i + 1))
                
                echo "- Adding review $review_index/$num_reviews from user $((i + 1))"
                if add_review "$pub_id" "$user_token" "$review_index" "$business_type"; then
                    ((total_reviews_added++))
                fi
                
                # Small delay between reviews
                sleep 1
            done
        done
        
        echo -e "\n✅ Added $total_reviews_added reviews to ${#publication_ids[@]} $business_type publications"
        return 0
    else
        echo "❌ Failed to fetch $business_type publications (Status: $status_code)"
        echo "Response: $json_response"
        return 1
    fi
}
# Add reviews to all business types
echo -e "\n=== Adding Reviews to Publications ==="

if [ -n "$RESTAURANT_TOKEN" ]; then
    add_reviews_to_publication "$RESTAURANT_TOKEN" "restaurant"
else
    print_error "Skipping restaurant reviews - no restaurant token"
fi

if [ -n "$CAFE_TOKEN" ]; then
    add_reviews_to_publication "$CAFE_TOKEN" "cafe"
else
    print_error "Skipping cafe reviews - no cafe token"
fi

if [ -n "$HOTEL_TOKEN" ]; then
    add_reviews_to_publication "$HOTEL_TOKEN" "hotel"
else
    print_error "Skipping hotel reviews - no hotel token"
fi

if [ -n "$HOSTEL_TOKEN" ]; then
    add_reviews_to_publication "$HOSTEL_TOKEN" "hostel"
else
    print_error "Skipping hostel reviews - no hostel token"
fi
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

# Add followers
# Camila follows Luisito and Julián
if [ -n "$USER1_TOKEN" ] && [ -n "$USER2_ID" ]; then
    add_follower "$USER1_TOKEN" "$USER2_ID" "Camila" "Luisito"
else
    print_error "Skipping: Camila follow Luisito - missing tokens or IDs"
fi

if [ -n "$USER1_TOKEN" ] && [ -n "$USER3_ID" ]; then
    add_follower "$USER1_TOKEN" "$USER3_ID" "Camila" "Julián"
else
    print_error "Skipping: Camila follow Julián - missing tokens or IDs"
fi

# Luisito follows Camila and José Luis
if [ -n "$USER2_TOKEN" ] && [ -n "$USER1_ID" ]; then
    add_follower "$USER2_TOKEN" "$USER1_ID" "Luisito" "Camila"
else
    print_error "Skipping: Luisito follow Camila - missing tokens or IDs"
fi

# Julián follows Camila and Luisito
if [ -n "$USER3_TOKEN" ] && [ -n "$USER1_ID" ]; then
    add_follower "$USER3_TOKEN" "$USER1_ID" "Julián" "Camila"
else
    print_error "Skipping: Julián follow Camila - missing tokens or IDs"
fi

if [ -n "$USER3_TOKEN" ] && [ -n "$USER2_ID" ]; then
    add_follower "$USER3_TOKEN" "$USER2_ID" "Julián" "Luisito"
else
    print_error "Skipping: Julián follow Luisito - missing tokens or IDs"
fi

# José Luis follows Camila and Julián
if [ -n "$USER4_TOKEN" ] && [ -n "$USER1_ID" ]; then
    add_follower "$USER4_TOKEN" "$USER1_ID" "José Luis" "Camila"
else
    print_error "Skipping: José Luis follow Camila - missing tokens or IDs"
fi

if [ -n "$USER4_TOKEN" ] && [ -n "$USER3_ID" ]; then
    add_follower "$USER4_TOKEN" "$USER3_ID" "José Luis" "Julián"
else
    print_error "Skipping: José Luis follow Julián - missing tokens or IDs"
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

# Function to add likes to a business's publications
add_likes_to_business() {
    local token="$1"
    local business_name="$2"
    local likes_per_publication=$3
    
    echo -n "Fetching publications for $business_name... "
    
    # Get publications for the business
    response=$(curl -s -X GET "$BASE_URL/publications/mine" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json")
    
    # Extract publication IDs
    pub_ids=($(echo "$response" | grep -o '"id":"[^"]*' | cut -d'"' -f4))
    
    if [ ${#pub_ids[@]} -gt 0 ]; then
        print_success "✅ Found ${#pub_ids[@]} publication(s)"
        
        local total_likes_added=0
        
        # Add likes to each publication
        for pub_id in "${pub_ids[@]}"; do
            echo -e "\nAdding likes to publication $pub_id"
            local likes_added=0
            
            # Add likes from different users
            for ((i=2; i<=4 && likes_added < likes_per_publication; i++)); do
                user_token_var="USER${i}_TOKEN"
                if [ -n "${!user_token_var}" ]; then
                    if add_like_to_publication "${!user_token_var}" "$pub_id" "User $i"; then
                        ((likes_added++))
                        ((total_likes_added++))
                    fi
                fi
            done
        done
        
        print_success "✅ Added $total_likes_added likes to $business_name's ${#pub_ids[@]} publications"
        return 0
    else
        print_error "❌ No publications found for $business_name"
        return 1
    fi
}

# Add 9 likes (3 per publication) to La Buena Mesa (which has 3 publications)
if [ -n "$RESTAURANT_TOKEN" ]; then
    echo -e "\n=== Añadiendo likes a La Buena Mesa (3 por publicación) ==="
    add_likes_to_business "$RESTAURANT_TOKEN" "La Buena Mesa" 3
else
    print_error "❌ No se encontró el token del restaurante"
fi

# Add 2-3 likes to Hotel Playa Dorada
if [ -n "$HOTEL_TOKEN" ]; then
    echo -e "\n=== Añadiendo likes a Hotel Playa Dorada (3 por publicación) ==="
    add_likes_to_business "$HOTEL_TOKEN" "Hotel Playa Dorada" 3
fi

# Add 1-2 likes to Café del Centro
if [ -n "$CAFE_TOKEN" ]; then
    echo -e "\n=== Añadiendo likes a Café del Centro (2 por publicación) ==="
    add_likes_to_business "$CAFE_TOKEN" "Café del Centro" 2
fi

# Add 1-2 likes to Hostel Montaña
if [ -n "$HOSTEL_TOKEN" ]; then
    echo -e "\n=== Añadiendo likes a Hostel Montaña (1 por publicación) ==="
    add_likes_to_business "$HOSTEL_TOKEN" "Hostel Montaña" 1
fi

# Add 2 likes to Brisa Marina (if token exists)
if [ -n "$BRISA_MARINA_TOKEN" ]; then
    echo -e "\n=== Añadiendo likes a Brisa Marina (2 por publicación) ==="
    add_likes_to_business "$BRISA_MARINA_TOKEN" "Brisa Marina" 2
fi

# Add 1-2 likes to El Encuentro Hostel (if token exists)
if [ -n "$EL_ENCUENTRO_TOKEN" ]; then
    echo -e "\n=== Añadiendo likes a El Encuentro Hostel (1 por publicación) ==="
    add_likes_to_business "$EL_ENCUENTRO_TOKEN" "El Encuentro Hostel" 1
fi

echo -e "\n=== Sample data loading completed! ==="
echo -e "\nYou can now log in with:"
echo -e "\n=== Regular Users ==="
echo "- User 1: camila@example.com / password123"
echo "- User 2: luisito@example.com / password123"
echo "- User 3: julian@example.com / password123"
echo "- User 4: joseluis@example.com / password123"
echo "- User 5: ricardo@example.com / password123"
echo "- User 6: astrid@example.com / password123"
echo "- User 7: aizen@example.com / password123"

echo -e "\n=== Business Accounts ==="
echo "- La Buena Mesa (Restaurante): info@labuenamesa.com / business123"
echo "- Playa Dorada (Hotel): anibalfu2005@gmail.com / business123"
echo "- Café del Centro: contacto@cafedelcentro.com / business123"
echo "- Hostal Montaña: info@hostelmontana.com / business123"
echo "- Brisa Marina: isabel@brisamarina.com / business123"
echo "- Sabores Peruanos: afu@fi.uba.ar / business123"
echo "- El Encuentro Hostel: diego@elencuentrohostel.com / business123"

echo -e "\nNote: All users have the password 'password123' for testing purposes."