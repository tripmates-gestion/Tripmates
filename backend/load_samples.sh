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
    if [ ! -z "$data" ]; then
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
    if [ ! -z "$auth_header" ]; then
        cmd+=" -H \"Authorization: Bearer $auth_header\""
    fi
    
    # Handle data and file upload
    if [ "$is_multipart" = true ]; then
        # For multipart, add data if provided
        if [ ! -z "$temp_file" ]; then
            cmd+=" -F \"data=@$temp_file;type=application/json\""
        fi
        
        # Add files if provided
        if [ ! -z "$file_paths" ]; then
            IFS=',' read -ra FILES <<< "$file_paths"
            for file_path in "${FILES[@]}"; do
                if [ -f "$file_path" ]; then
                    cmd+=" -F \"$file_field=@$file_path\""
                fi
            done
        fi
    else
        # For regular JSON
        if [ ! -z "$temp_file" ]; then
            cmd+=" -d @$temp_file"
        fi
    fi
    
    # Execute the command
    response=$(eval $cmd 2>&1)
    local status_code=$(echo "$response" | tail -n1)
    local json_response=$(echo "$response" | head -n -1)
    
    # Clean up temporary file
    if [ ! -z "$temp_file" ] && [ -f "$temp_file" ]; then
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

# Function to update user profile picture
update_profile_picture() {
    local user_token=$1
    local image_path=$2
    
    if [ -z "$user_token" ] || [ ! -f "$image_path" ]; then
        return 1
    fi
    
    echo -n "Updating user profile picture... "
    
    # Create a temporary file for the update data
    local temp_file=$(mktemp)
    echo '{}' > "$temp_file"
    
    # Use make_request to handle the multipart form data
    response=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/users/me" \
        -H "Authorization: Bearer $user_token" \
        -H "Content-Type: multipart/form-data" \
        -F "data=@$temp_file;type=application/json" \
        -F "avatar=@$image_path")
    
    # Clean up temp file
    rm -f "$temp_file"
    
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

# Function to update business profile with all fields and images
update_business_picture() {
    local business_token=$1
    local business_type=$2  # 'restaurant' or 'hotel'
    
    if [ -z "$business_token" ]; then
        return 1
    fi
    
    echo -e "\n=== Updating $business_type profile with all fields and images ==="
    
    # Set business details based on type
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
    
    if [ "$business_type" = "restaurant" ]; then
        name="La Buena Mesa"
        description="Un restaurante familiar con los mejores platos de la cocina tradicional"
        location="Av. Corrientes 1234, Buenos Aires"
        phoneNumber="+54 11 1234-5678"
        publicEmail="contacto@labuenamesa.com"
        businessType="RESTAURANT"
        averagePrice="$$"
        restaurantType="Argentino"
        attentionSchedule='{"openingTime":"09:00","closingTime":"23:00"}'
        openingDays='["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]'
        profile_image="sample_images/profile_pictures/restaurant.jpg"
    else  # hotel
        name="Hotel Playa Dorada"
        description="Un hotel de lujo frente al mar con todas las comodidades"
        location="Av. Costanera 2345, Mar del Plata"
        phoneNumber="+54 223 123-4567"
        publicEmail="reservas@hotelplayadorada.com"
        businessType="HOSTING"
        averagePrice="$$$"
        hotelType="Hotel"
        profile_image="sample_images/profile_pictures/hotel.jpg"
    fi
    
    # Create a temporary file for the update data
    local temp_file=$(mktemp)
    
    # Create the JSON data for the update with properly escaped dollar signs
    if [ "$business_type" = "restaurant" ]; then
        cat > "$temp_file" << EOF
{
    "name": "$name",
    "description": "$description",
    "location": "$location",
    "phoneNumber": "$phoneNumber",
    "publicEmail": "$publicEmail",
    "averagePrice": "\$\$",
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
    "averagePrice": "\$\$\$",
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
    
    # Add additional business images based on type
    if [ "$business_type" = "restaurant" ] && [ -f "sample_images/business_picture/restaurante1.jpeg" ]; then
        curl_cmd+=(
            "-F" "files=@sample_images/business_picture/restaurante1.jpeg"
        )
    elif [ "$business_type" = "hotel" ] && [ -f "sample_images/business_picture/playa1.jpeg" ]; then
        curl_cmd+=(
            "-F" "files=@sample_images/business_picture/playa1.jpeg"
        )
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
    if [ ! -z "$image_paths" ]; then
        IFS=',' read -ra FILES <<< "$image_paths"
        for file_path in "${FILES[@]}"; do
            if [ -f "$file_path" ]; then
                cmd+=" -F \"files=@$file_path\""
            fi
        done
    fi
    
    # Execute the command
    response=$(eval $cmd 2>&1)
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

# 3. Update profile pictures
echo -e "\n=== Updating Profile Pictures ==="

# Update user profile pictures (if image files exist)
if [ -f "sample_images/profile_pictures/user1.jpg" ]; then
    update_profile_picture "$USER1_TOKEN" "sample_images/profile_pictures/user1.jpg"
fi

if [ -f "sample_images/profile_pictures/user2.jpg" ]; then
    update_profile_picture "$USER2_TOKEN" "sample_images/profile_pictures/user2.jpg"
fi

# Update business profiles with all fields and images
if [ ! -z "$RESTAURANT_TOKEN" ]; then
    update_business_picture "$RESTAURANT_TOKEN" "restaurant"
fi

if [ ! -z "$HOTEL_TOKEN" ]; then
    update_business_picture "$HOTEL_TOKEN" "hotel"
fi

# 4. Create publications (only for businesses)
echo -e "\n=== Creating Publications ==="

# Function to create a publication with dynamic images
create_publication() {
    local token="$1"
    local business_type="$2"
    local index=$3
    
    local title=""
    local description=""
    local phone=""
    local email=""
    local location=""
    local opening_days=""
    local opening_time=""
    local closing_time=""
    local image_path=""
    
    if [ "$business_type" == "restaurant" ]; then
        case $index in
            1)
                title="Menú Especial de Otoño"
                description="Disfruta de nuestro menú de temporada con ingredientes frescos y locales."
                phone="+54 11 1234-5678"
                email="reservas@labuenamesa.com"
                location="Av. Corrientes 1234, Buenos Aires"
                opening_days='["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]'
                opening_time="12:00"
                closing_time="23:00"
                exceptional_days='["2025-12-25", "2026-01-01"]'
                tags='["restaurante", "comida", "menú", "especial"]'
                image_path="sample_images/publications/restaurant/cena1.jpg"
                ;;
            2)
                title="Cena Romántica con Vista al Río"
                description="Vive una experiencia gastronómica inolvidable con nuestra cena de 5 pasos y vino de la casa."
                phone="+54 11 5555-1234"
                email="eventos@labuenamesa.com"
                location="Puerto Madero, Dique 2, Buenos Aires"
                opening_days='["THURSDAY", "FRIDAY", "SATURDAY"]'
                opening_time="20:00"
                closing_time="00:00"
                exceptional_days='["2025-12-24", "2025-12-31"]'
                tags='["cena", "romántico", "vista al río", "alta cocina"]'
                # No image for this one since we only have one restaurant image
                ;;
        esac
    elif [ "$business_type" == "hotel" ]; then
        case $index in
            1)
                title="Escape a la Playa - Oferta Especial"
                description="Disfruta de unas vacaciones inolvidables frente al mar con nuestro paquete todo incluido."
                phone="+54 11 8765-4321"
                email="info@playadorada.com"
                location="Av. Costanera 2500, Mar del Plata"
                opening_days='["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]'
                opening_time="00:00"
                closing_time="23:59"
                exceptional_days='[]'
                tags='["hotel", "playa", "vacaciones", "todo incluido"]'
                image_path="sample_images/publications/hotel/playa1.jpeg"
                ;;
        esac
    fi
    
    # Create the publication
    local data=$(cat <<EOF
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
)

    # Only include image if it exists
    if [ -f "$image_path" ]; then
        make_request "/publications/business" "$data" "Creating $business_type publication $index" "$token" "multipart/form-data" "POST" "files" "$image_path" true
    else
        make_request "/publications/business" "$data" "Creating $business_type publication $index" "$token" "application/json" "POST"
    fi
}

# Create restaurant publications
if [ ! -z "$RESTAURANT_TOKEN" ]; then
    # Check how many restaurant publications we have images for
    if [ -d "sample_images/publications/restaurant" ]; then
        pub_count=$(find "sample_images/publications/restaurant" -maxdepth 1 -type f | wc -l)
        for ((i=1; i<=$pub_count; i++)); do
            create_publication "$RESTAURANT_TOKEN" "restaurant" $i
        done
    fi
    
    # If no images but we still want to create at least one publication
    if [ "$pub_count" -eq 0 ]; then
        create_publication "$RESTAURANT_TOKEN" "restaurant" 1
    fi
fi

# Create hotel publications
if [ ! -z "$HOTEL_TOKEN" ]; then
    # Check how many hotel publications we have images for
    if [ -d "sample_images/publications/hotel" ]; then
        pub_count=$(find "sample_images/publications/hotel" -maxdepth 1 -type f | wc -l)
        for ((i=1; i<=$pub_count; i++)); do
            create_publication "$HOTEL_TOKEN" "hotel" $i
        done
    fi
    
    # If no images but we still want to create at least one publication
    if [ "$pub_count" -eq 0 ]; then
        create_publication "$HOTEL_TOKEN" "hotel" 1
    fi
fi

# 5. Create restaurant menus and room packs
echo -e "\n=== Creating Restaurant Menus and Room Packs ==="

# Function to add a menu item with dynamic images
add_menu_item() {
    local token="$1"
    local index=$2
    
    local food_name=""
    local price=0
    local description=""
    local image_path=""
    
    case $index in
        1)
            food_name="Milanesa Napolitana"
            price=3500
            description="Milanesa de carne con salsa de tomate, jamón y queso gratinado. Acompañada con papas fritas."
            image_path="sample_images/menu_items/milanesa.jpeg"
            ;;
        2)
            food_name="Ensalada César"
            price=2200
            description="Lechuga romana, crutones, queso parmesano, con aderezo César."
            # No image for this one
            ;;
        3)
            food_name="Pizza Margherita"
            price=2800
            description="Clásica pizza con salsa de tomate, mozzarella fresca, albahaca y aceite de oliva."
            # No image for this one
            ;;
    esac
    
    local data=$(cat <<EOF
{
    "foodName": "$food_name",
    "price": $price,
    "description": "$description"
}
EOF
)

    # Only include image if it exists
    if [ -f "$image_path" ]; then
        make_request "/users/me/restaurant" "$data" "Adding $food_name to menu" "$token" "multipart/form-data" "POST" "files" "$image_path" true
    else
        make_request "/users/me/restaurant" "$data" "Adding $food_name to menu" "$token" "application/json" "POST"
    fi
}

# Function to add a room pack with dynamic images
add_room_pack() {
    local token="$1"
    local index=$2
    
    local title=""
    local description=""
    local check_in=""
    local check_out=""
    local guests=0
    local price=0
    local services='[]'
    local image_path=""
    
    case $index in
        1)
            title="Habitación Estándar con Vista al Mar"
            description="Habitación doble con vista al mar. Incluye desayuno buffet y acceso a todas las instalaciones del hotel."
            check_in="2025-12-20"
            check_out="2025-12-27"
            guests=2
            price=25000
            services='["desayuno", "wifi", "piscina", "estacionamiento"]'
            image_path="sample_images/room_packs/playa.jpg"
            ;;
        2)
            title="Suite Familiar"
            description="Amplia suite familiar con sala de estar y cocineta. Incluye acceso al spa y gimnasio."
            check_in="2025-12-20"
            check_out="2025-12-25"
            guests=4
            price=45000
            services='["desayuno", "wifi", "piscina", "spa", "gimnasio", "estacionamiento"]'
            # No image for this one
            ;;
    esac
    
    local data=$(cat <<EOF
{
    "checkInDate": "$check_in",
    "checkOutDate": "$check_out",
    "numberOfGuests": $guests,
    "services": $services,
    "price": $price,
    "description": "$description"
}
EOF
)

    # Only include image if it exists
    if [ -f "$image_path" ]; then
        make_request "/users/me/hosting" "$data" "Adding $title" "$token" "multipart/form-data" "POST" "files" "$image_path" true
    else
        make_request "/users/me/hosting" "$data" "Adding $title" "$token" "application/json" "POST"
    fi
}

# Add menu items for restaurant
if [ ! -z "$RESTAURANT_TOKEN" ]; then
    # Check how many menu item images we have
    if [ -d "sample_images/menu_items" ]; then
        menu_count=$(find "sample_images/menu_items" -maxdepth 1 -type f | wc -l)
        for ((i=1; i<=$menu_count; i++)); do
            add_menu_item "$RESTAURANT_TOKEN" $i
        done
    fi
    
    # If no images but we still want to create at least one menu item
    if [ "$menu_count" -eq 0 ]; then
        add_menu_item "$RESTAURANT_TOKEN" 1
    fi
fi

# Add room packs for hotel
if [ ! -z "$HOTEL_TOKEN" ]; then
    # Check how many room pack images we have
    if [ -d "sample_images/room_packs" ]; then
        room_count=$(find "sample_images/room_packs" -maxdepth 1 -type f | wc -l)
        for ((i=1; i<=$room_count; i++)); do
            add_room_pack "$HOTEL_TOKEN" $i
        done
    fi
    
    # If no images but we still want to create at least one room pack
    if [ "$room_count" -eq 0 ]; then
        add_room_pack "$HOTEL_TOKEN" 1
    fi
fi

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
            # No image for this review
            ;;
    esac
    
    local data=$(cat <<EOF
{
    "title": "$title",
    "content": "$content",
    "rating": $rating
}
EOF
)

    # Only include image if it exists
    if [ -f "$image_path" ]; then
        add_review_with_image "$publication_id" "$data" "$token" "$image_path"
    else
        # Use regular make_request for reviews without images
        make_request "/publications/$publication_id/review" "$data" "Adding review: $title" "$token" "application/json" "POST"
    fi
}

# First, let's get the list of publications to get their IDs
if [ ! -z "$USER1_TOKEN" ] && [ ! -z "$RESTAURANT_TOKEN" ]; then
    echo -n "Getting list of publications... "
    
    # Instead of using /publications, let's use the search endpoint
    response=$(curl -s -X GET "$BASE_URL/publications/search" \
        -H "Authorization: Bearer $RESTAURANT_TOKEN" \
        -H "Content-Type: application/json" \
        -w "\n%{http_code}")
    
    status_code=$(echo "$response" | tail -n1)
    if [[ $status_code -ge 200 && $status_code -lt 300 ]]; then
        print_success "✅ Success! (Status: $status_code)"
        # Extract the first publication ID (assuming there's at least one)
        publication_id=$(echo "$response" | head -n -1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        
        if [ ! -z "$publication_id" ]; then
            # Check how many review images we have
            if [ -d "sample_images/reviews" ]; then
                review_count=$(find "sample_images/reviews" -maxdepth 1 -type f | wc -l)
                
                # Add reviews for each user (up to the number of review images available)
                if [ $review_count -gt 0 ] && [ ! -z "$USER1_TOKEN" ]; then
                    add_review "$publication_id" "$USER1_TOKEN" 1
                fi
                
                if [ $review_count -gt 1 ] && [ ! -z "$USER2_TOKEN" ]; then
                    add_review "$publication_id" "$USER2_TOKEN" 2
                fi
                
                # If no review images but we still want to add at least one review
                if [ $review_count -eq 0 ] && [ ! -z "$USER1_TOKEN" ]; then
                    add_review "$publication_id" "$USER1_TOKEN" 1
                fi
            else
                # If no reviews directory, add at least one review without an image
                if [ ! -z "$USER1_TOKEN" ]; then
                    add_review "$publication_id" "$USER1_TOKEN" 1
                fi
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