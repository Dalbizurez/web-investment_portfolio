import React, { useEffect } from "react";
import "../styles/styles.css";


const InviteSection: React.FC = () => {
    useEffect(() => {
        const shareButton = document.getElementById("shareButton");

        const handleShare = async () => {
        const link = "https://hapi.app/ref/invite";

        if (navigator.share) {
            try {
            await navigator.share({
                title: "Invite to Hapi",
                text: "Join Hapi and earn free cryptocurrency.",
                url: link,
            });
            alert("Link shared successfully!");
            } catch (err) {
            console.error("Error sharing link:", err);
            }
        } else {
            navigator.clipboard.writeText(link);
            alert("Link copied to clipboard: " + link);
        }
        };

        shareButton?.addEventListener("click", handleShare);

        return () => {
        shareButton?.removeEventListener("click", handleShare);
        };
    }, []);

    return (
        <section className="invite-section">
        <p className="section-title">Referred</p>
        <h2>Invite friends. Earn crypto!</h2>
        <p>
            Invite your friends to Hapi. Once they register and deposit funds, both
            of you will receive free cryptocurrency rewards.
        </p>

        <button className="share-button" id="shareButton">
            Share link
        </button>

        <div className="details">
            <h3>100% chance to win a prize</h3>
            <p>
            Every time a friend registers and deposits, you get a free crypto
            reward in your account.{" "}
            <a href="#">Read terms and conditions here.</a>
            </p>

            <h3>Win up to $500 in crypto</h3>
            <p>
            You have 1 in 400 chance to win $500, 1 in 100 to win $20, 1 in 20 to
            win $10, and 1 in 2 to win $1.
            </p>

            <h3>Unlimited invitations</h3>
            <p>
            Invite as many friends as you want and earn crypto rewards for each
            one.
            </p>
        </div>
        </section>
    );
};

export default InviteSection;
