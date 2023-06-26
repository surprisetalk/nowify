{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = inputs:
    inputs.flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import inputs.nixpkgs { inherit system; };
      in { 
        formatter = pkgs.nixpkgs-fmt;

        devShell = pkgs.mkShell { packages = [ pkgs.deno ]; };
      }
    );
}
