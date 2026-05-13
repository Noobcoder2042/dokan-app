import { Autocomplete, Grid, TextField, Box, Typography } from "@mui/material";

const CustomerDetails = ({
  customerName,
  customerPhone,
  customerAddress,
  customerOptions,
  onNameChange,
  onPhoneChange,
  onAddressChange,
  onCustomerSelect,
  nameInputRef,
  phoneInputRef,
  addressInputRef,
  onNameKeyDown,
  onPhoneKeyDown,
  onAddressKeyDown,
}) => {
  // Smart normalize function
  const normalize = (text = "") =>
    String(text)
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

  // Selected customer
  const selectedCustomer =
    customerOptions.find(
      (option) => normalize(option.name) === normalize(customerName),
    ) || null;

  return (
    <>
      <Grid item xs={12}>
        <Autocomplete
          freeSolo
          fullWidth
          openOnFocus
          autoHighlight
          selectOnFocus
          clearOnBlur={false}
          handleHomeEndKeys
          noOptionsText="No customer found"
          options={[...customerOptions].sort(
            (a, b) => (b.lastUsed || 0) - (a.lastUsed || 0),
          )}
          value={selectedCustomer}
          inputValue={customerName}
          filterOptions={(options, state) => {
            const input = normalize(state.inputValue);

            // Show only recent customers when empty
            if (!input) {
              return options.slice(0, 8);
            }

            const filtered = options.filter((option) => {
              const name = normalize(option.name);
              const phone = normalize(option.phoneNumber);
              const address = normalize(option.address);

              return (
                name.includes(input) ||
                phone.includes(input) ||
                address.includes(input)
              );
            });

            // Add create new customer option
            const exactMatch = filtered.some(
              (option) => normalize(option.name) === input,
            );

            if (!exactMatch) {
              filtered.push({
                name: `➕ Add "${state.inputValue}"`,
                isNew: true,
              });
            }

            return filtered.slice(0, 10);
          }}
          getOptionLabel={(option) => {
            if (typeof option === "string") {
              return option;
            }

            return option.name || "";
          }}
          isOptionEqualToValue={(option, value) =>
            normalize(option.name) === normalize(value.name)
          }
          onInputChange={(_, value, reason) => {
            if (reason === "input") {
              onNameChange(value);
            }
          }}
          onChange={(_, value) => {
            if (!value) return;

            // Typed manually
            if (typeof value === "string") {
              onNameChange(value);
              return;
            }

            // Add new customer
            if (value.isNew) {
              const cleanName = value.name
                .replace('➕ Add "', "")
                .replace('"', "");

              onNameChange(cleanName);
              onPhoneChange("");
              onAddressChange("");
              return;
            }

            // Existing customer selected
            onCustomerSelect(value);
          }}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              sx={{
                py: 1.2,
                px: 2,
                borderBottom: "1px solid #f1f1f1",
                alignItems: "flex-start",
              }}
            >
              {option.isNew ? (
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                  }}
                >
                  {option.name}
                </Typography>
              ) : (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "15px",
                    }}
                  >
                    {option.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    📞 {option.phoneNumber || "No Phone"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    📍 {option.address || "No Address"}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Customer Name"
              placeholder="Search by name, phone or address..."
              helperText={`${customerOptions.length} customers available`}
              fullWidth
              inputRef={nameInputRef}
              onKeyDown={onNameKeyDown}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  backgroundColor: "#fff",
                  fontSize: "16px",
                },
              }}
            />
          )}
        />
      </Grid>

      {/* PHONE FIELD */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="Customer Phone"
          placeholder="Enter customer phone"
          value={customerPhone}
          onChange={(event) => onPhoneChange(event.target.value)}
          onKeyDown={onPhoneKeyDown}
          inputRef={phoneInputRef}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "16px",
              backgroundColor: "#fff",
            },
          }}
        />
      </Grid>

      {/* ADDRESS FIELD */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="Customer Address"
          placeholder="Enter customer address"
          value={customerAddress}
          onChange={(event) => onAddressChange(event.target.value)}
          onKeyDown={onAddressKeyDown}
          inputRef={addressInputRef}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "16px",
              backgroundColor: "#fff",
            },
          }}
        />
      </Grid>
    </>
  );
};

export default CustomerDetails;
