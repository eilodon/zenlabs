fn main() {
    uniffi::generate_scaffolding("zenone.udl").expect("Failed to generate UniFFI scaffolding");
}
