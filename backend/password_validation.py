from zxcvbn import zxcvbn

def validate_password_strength(password):
    '''
    validates password strength using zxcvbn
    Returns: (bool, str) - is_valid, message
    '''

    result = zxcvbn(password)

    if result['score'] <= 2:
        return False, "Password is too weak. Please use a stronger password."

    return True, "password is strong"   