-- ============================================================================
-- PARTY GAME SHOW - ESQUEMA DE BASE DE DATOS & REALTIME
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: ROOMS (Salas de Juego)
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(4) NOT NULL UNIQUE,
    host_token VARCHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'paused', 'podium', 'ended')),
    active_teams_count INT NOT NULL DEFAULT 5 CHECK (active_teams_count BETWEEN 2 AND 8),
    current_game VARCHAR(50) DEFAULT 'buzzer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: TEAMS (Equipos con Paleta Arcade)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    team_index INT NOT NULL CHECK (team_index BETWEEN 1 AND 8),
    name VARCHAR(50) NOT NULL,
    theme VARCHAR(50) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    color_tw VARCHAR(30) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (room_id, team_index)
);

-- 3. TABLA: PLAYERS (Jugadores conectados desde móvil)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    nickname VARCHAR(30) NOT NULL,
    session_token VARCHAR(64) NOT NULL,
    is_connected BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: GAME_STATES (Estado volátil de rondas)
CREATE TABLE IF NOT EXISTS game_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL UNIQUE REFERENCES rooms(id) ON DELETE CASCADE,
    round_number INT NOT NULL DEFAULT 1,
    buzzer_locked BOOLEAN NOT NULL DEFAULT FALSE,
    buzzer_winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    buzzer_winner_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    buzzer_pressed_at TIMESTAMPTZ DEFAULT NULL,
    timer_seconds INT DEFAULT NULL,
    timer_ends_at TIMESTAMPTZ DEFAULT NULL,
    secret_card JSONB DEFAULT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FUNCIÓN: Crear sala con equipos iniciales
CREATE OR REPLACE FUNCTION create_game_room(
    p_code VARCHAR(4),
    p_host_token VARCHAR(64),
    p_teams_count INT DEFAULT 5
)
RETURNS UUID AS $$
DECLARE
    v_room_id UUID;
    v_team_names TEXT[] := ARRAY['Azul', 'Rojo', 'Amarillo', 'Blanco', 'Negro', 'Verde', 'Morado', 'Naranja'];
    v_themes TEXT[] := ARRAY['Rayo Eléctrico', 'Fuego / Rubí', 'Estrella / Sol', 'Luz / Diamante', 'Sombra / Ónix', 'Ácido / Neón', 'Galaxia / Místico', 'Solar / Magma'];
    v_colors_hex TEXT[] := ARRAY['#3B82F6', '#EF4444', '#FACC15', '#FFFFFF', '#94A3B8', '#22C55E', '#A855F7', '#F97316'];
    v_colors_tw TEXT[] := ARRAY['bg-blue-500', 'bg-red-500', 'bg-yellow-400', 'bg-white', 'bg-zinc-900', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
    i INT;
BEGIN
    INSERT INTO rooms (code, host_token, active_teams_count)
    VALUES (UPPER(p_code), p_host_token, p_teams_count)
    RETURNING id INTO v_room_id;

    FOR i IN 1..8 LOOP
        INSERT INTO teams (room_id, team_index, name, theme, color_hex, color_tw, is_active)
        VALUES (
            v_room_id,
            i,
            v_team_names[i],
            v_themes[i],
            v_colors_hex[i],
            v_colors_tw[i],
            (i <= p_teams_count)
        );
    END LOOP;

    INSERT INTO game_states (room_id)
    VALUES (v_room_id);

    RETURN v_room_id;
END;
$$ LANGUAGE plpgsql;

-- 6. FUNCIÓN: Actualizar número de equipos activos
CREATE OR REPLACE FUNCTION set_active_teams_count(
    p_room_id UUID,
    p_count INT
)
RETURNS VOID AS $$
BEGIN
    UPDATE rooms 
    SET active_teams_count = p_count, updated_at = NOW() 
    WHERE id = p_room_id;

    UPDATE teams 
    SET is_active = (team_index <= p_count) 
    WHERE room_id = p_room_id;
END;
$$ LANGUAGE plpgsql;

-- 7. POLÍTICAS RLS PÚBLICAS PARA EVENTO SOCIAL
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public Read Teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public Read Players" ON players FOR SELECT USING (true);
CREATE POLICY "Public Read Game States" ON game_states FOR SELECT USING (true);

CREATE POLICY "Public Insert Players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Players" ON players FOR UPDATE USING (true);

CREATE POLICY "Public Insert Rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Rooms" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Public Update Teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Public Update Game States" ON game_states FOR UPDATE USING (true);

-- 8. HABILITAR REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_states;
