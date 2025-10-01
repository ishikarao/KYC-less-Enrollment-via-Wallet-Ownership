module MyModule::KYClessEnrollment {
    use aptos_framework::signer;
    use std::string::String;
    use aptos_framework::timestamp;

    /// Struct representing an enrolled user
    struct UserProfile has store, key {
        wallet_address: address,
        enrollment_time: u64,
        is_active: bool,
    }

    /// Error codes
    const E_ALREADY_ENROLLED: u64 = 1;
    const E_NOT_ENROLLED: u64 = 2;

    /// Function to enroll a user using their wallet address
    public entry fun enroll_user(user: &signer) {
        let user_addr = signer::address_of(user);
        
        // Check if user is already enrolled
        assert!(!exists<UserProfile>(user_addr), E_ALREADY_ENROLLED);
        
        // Create user profile
        let profile = UserProfile {
            wallet_address: user_addr,
            enrollment_time: timestamp::now_seconds(),
            is_active: true,
        };
        
        move_to(user, profile);
    }

    /// Function to check if a user is enrolled
    #[view]
    public fun is_user_enrolled(user_addr: address): bool acquires UserProfile {
        if (exists<UserProfile>(user_addr)) {
            let profile = borrow_global<UserProfile>(user_addr);
            profile.is_active
        } else {
            false
        }
    }
}